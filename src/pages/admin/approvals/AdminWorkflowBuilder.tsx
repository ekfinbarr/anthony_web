import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge, type StatusType } from "@/components/admin/shared/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  activateWorkflow,
  createWorkflow,
  getWorkflow,
  getWorkflowMeta,
  updateWorkflow,
  validateWorkflow,
  type WorkflowAssignee,
  type WorkflowDefinition,
  type WorkflowRule,
  type WorkflowStep,
} from "@/services/workflow.service";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";

import { IsoDatePicker } from "@/components/ui/date-picker";
const BACKUP_POLICIES = [
  { value: "on_sla", label: "When the step's SLA is exceeded" },
  { value: "on_primary_unavailable", label: "Immediately if no primary approver is available" },
  { value: "on_decline_or_reassign", label: "When a primary declines or is reassigned" },
  { value: "parallel_standby", label: "Visible as standby; act once activated" },
];

type StepDraft = WorkflowStep & { key: string; primary: string[]; backup: string[] };

const newKey = () => Math.random().toString(36).slice(2);

const toTokens = (assignees: WorkflowAssignee[] | undefined, tier: "primary" | "backup") =>
  (assignees ?? [])
    .filter((a) => a.tier === tier)
    .map((a) => (a.assignee_kind === "role" ? `role:${a.role_name}` : `user:${a.user_id}`));

const fromTokens = (tokens: string[], tier: "primary" | "backup"): WorkflowAssignee[] =>
  tokens.map((token, i) => {
    const [kind, ...rest] = token.split(":");
    const value = rest.join(":");
    return kind === "role"
      ? { tier, assignee_kind: "role", role_name: value, sort_order: i }
      : { tier, assignee_kind: "user", user_id: value, sort_order: i };
  });

const blankStep = (order: number): StepDraft => ({
  key: newKey(),
  name: `Step ${order}`,
  step_order: order,
  mode: "sequential",
  quorum: 1,
  sla_hours: 48,
  backup_activation_policy: "on_sla",
  backups_count_toward_quorum: false,
  primary: [],
  backup: [],
});

/** The version the builder edits: an open draft first, then the active version. */
const editableVersion = (wf: WorkflowDefinition) =>
  wf.versions?.filter((v) => v.status === "draft").sort((a, b) => b.version_number - a.version_number)[0] ??
  wf.active_version ??
  wf.versions?.slice().sort((a, b) => b.version_number - a.version_number)[0];

export default function AdminWorkflowBuilder() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission, isAdmin } = useAuth();
  const canManage = isAdmin() || hasPermission("manage workflows");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [publishBehavior, setPublishBehavior] = useState("manual");
  const [rejectionBehavior, setRejectionBehavior] = useState("return_to_requester");
  const [allowSelfApproval, setAllowSelfApproval] = useState(false);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveUntil, setEffectiveUntil] = useState("");
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [steps, setSteps] = useState<StepDraft[]>([blankStep(1)]);
  const [stepsDirty, setStepsDirty] = useState(isNew);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);

  const { data: meta } = useQuery({ queryKey: ["workflow-meta"], queryFn: getWorkflowMeta });
  const { data: workflow, isLoading } = useQuery({
    queryKey: ["workflow", id],
    queryFn: () => getWorkflow(id!),
    enabled: !isNew,
  });

  // Load the fetched workflow into the editor once per response (adjusted during
  // render, not in an effect). Loaded steps are keyed by their stable ids.
  const [loadedWorkflow, setLoadedWorkflow] = useState<WorkflowDefinition | null>(null);
  if (workflow && workflow !== loadedWorkflow) {
    setLoadedWorkflow(workflow);
    setName(workflow.name);
    setDescription(workflow.description ?? "");
    setPublishBehavior(workflow.publish_behavior);
    setRejectionBehavior(workflow.rejection_behavior);
    setAllowSelfApproval(workflow.allow_self_approval);
    setEffectiveFrom(workflow.effective_from?.slice(0, 10) ?? "");
    setEffectiveUntil(workflow.effective_until?.slice(0, 10) ?? "");
    setRules(workflow.rules ?? []);
    const loaded = (editableVersion(workflow)?.steps ?? [])
      .slice()
      .sort((x, y) => x.step_order - y.step_order)
      .map((step, index) => ({
        ...step,
        key: step.id ?? `loaded-${index}`,
        primary: toTokens(step.assignees, "primary"),
        backup: toTokens(step.assignees, "backup"),
      }));
    setSteps(loaded.length ? loaded : [blankStep(1)]);
    setStepsDirty(false);
    setValidation(null);
  }

  const version = workflow ? editableVersion(workflow) : undefined;
  const editingActive = version?.status === "active";

  const assigneeOptions: MultiSelectOption[] = useMemo(
    () => [
      ...(meta?.roles ?? []).map((r) => ({ value: `role:${r}`, label: r.replace(/_/g, " "), group: "Roles", description: "Everyone holding this role" })),
      ...(meta?.users ?? []).map((u) => ({ value: `user:${u.id}`, label: u.name, group: "People", description: u.roles.join(", ") || u.email })),
    ],
    [meta]
  );

  const sensitiveSelected = rules.some((r) => meta?.content_types.find((t) => t.key === r.content_type)?.sensitive);

  const updateStep = (key: string, patch: Partial<StepDraft>) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
    setStepsDirty(true);
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length || from === to) return;
    setSteps((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setStepsDirty(true);
  };

  const buildPayload = (includeSteps: boolean) => ({
    name,
    description: description || null,
    publish_behavior: publishBehavior,
    rejection_behavior: rejectionBehavior,
    allow_self_approval: allowSelfApproval,
    effective_from: effectiveFrom || null,
    effective_until: effectiveUntil || null,
    rules: rules.map((r) => ({
      content_type: r.content_type,
      operation: r.operation || "publish",
      priority: Number(r.priority ?? 100),
      is_mandatory: !!r.is_mandatory,
      is_active: r.is_active ?? true,
      conditions: r.conditions && Object.keys(r.conditions).length ? r.conditions : null,
    })),
    ...(includeSteps
      ? {
          steps: steps.map((s, i) => ({
            name: s.name,
            description: s.description || null,
            step_order: i + 1,
            mode: s.mode,
            quorum: Number(s.quorum) || 1,
            sla_hours: s.sla_hours ? Number(s.sla_hours) : null,
            backup_activation_policy: s.backup_activation_policy || "on_sla",
            backups_count_toward_quorum: !!s.backups_count_toward_quorum,
            assignees: [...fromTokens(s.primary, "primary"), ...fromTokens(s.backup, "backup")],
          })),
        }
      : {}),
  });

  const save = useMutation({
    mutationFn: () =>
      isNew ? createWorkflow(buildPayload(true)) : updateWorkflow(id!, buildPayload(stepsDirty)),
    onSuccess: (res) => {
      notify.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.setQueryData(["workflow", res.data.id], res.data);
      if (isNew) navigate(`/admin/approvals/workflows/${res.data.id}`, { replace: true });
    },
    onError: (error) => notify.error(error, { description: "The workflow could not be saved." }),
  });

  const validate = useMutation({
    mutationFn: () => validateWorkflow(id!),
    onSuccess: (res) => setValidation(res),
    onError: (error) => notify.error(error),
  });

  const activate = useMutation({
    mutationFn: () => activateWorkflow(id!),
    onSuccess: (res) => {
      notify.success(res.message);
      setValidation(null);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.setQueryData(["workflow", id], res.data);
    },
    onError: (error) => notify.error(error, { description: "Fix the problems below, then activate again." }),
  });

  if (!isNew && isLoading) return <p className="text-muted-foreground">Loading workflow…</p>;

  const readOnly = !canManage;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 px-0">
            <Link to="/admin/approvals/workflows">← All workflows</Link>
          </Button>
          <h1 className="text-2xl font-heading font-bold">{isNew ? "New workflow" : name || "Workflow"}</h1>
          {workflow && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={workflow.status as StatusType} />
              {version && (
                <Badge variant="outline">
                  Editing v{version.version_number} ({version.status})
                </Badge>
              )}
            </div>
          )}
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            {!isNew && (
              <Button variant="outline" onClick={() => validate.mutate()} disabled={validate.isPending || stepsDirty}>
                Validate
              </Button>
            )}
            {!isNew && (
              <Button
                variant="secondary"
                onClick={() => activate.mutate()}
                disabled={activate.isPending || stepsDirty || (workflow?.status === "active" && version?.status === "active")}
              >
                Activate
              </Button>
            )}
            <Button onClick={() => save.mutate()} disabled={save.isPending || !name.trim()}>
              {isNew ? "Create draft" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {editingActive && stepsDirty && (
        <Alert>
          <AlertTitle>Saving creates a new draft version</AlertTitle>
          <AlertDescription>
            Active versions are never edited in place. Requests already in review stay on v{version?.version_number};
            new submissions use the new version once you activate it.
          </AlertDescription>
        </Alert>
      )}
      {stepsDirty && !isNew && (
        <p className="text-xs text-muted-foreground">Save your step changes before validating or activating.</p>
      )}

      {validation && (
        <Alert variant={validation.valid ? "default" : "destructive"}>
          <AlertTitle>{validation.valid ? "Ready to activate" : "This workflow can't be activated yet"}</AlertTitle>
          {!validation.valid && (
            <AlertDescription>
              <ul className="list-disc pl-5 space-y-1">
                {validation.errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </AlertDescription>
          )}
        </Alert>
      )}

      <fieldset disabled={readOnly} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="wf-name">Name</Label>
              <Input id="wf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Standard content review" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="wf-desc">Description</Label>
              <Textarea id="wf-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>When fully approved</Label>
              <Select value={publishBehavior} onValueChange={setPublishBehavior}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Publish immediately</SelectItem>
                  <SelectItem value="manual">Mark approved; publish manually</SelectItem>
                  <SelectItem value="scheduled">Mark scheduled; publish at its scheduled time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>When rejected</Label>
              <Select value={rejectionBehavior} onValueChange={setRejectionBehavior}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="return_to_requester">Return to requester for changes</SelectItem>
                  <SelectItem value="deny">Close the request as rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wf-from">Effective from</Label>
              <IsoDatePicker id="wf-from" value={effectiveFrom} onChange={setEffectiveFrom} max={effectiveUntil || undefined} placeholder="Immediately" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wf-until">Effective until</Label>
              <IsoDatePicker id="wf-until" value={effectiveUntil} onChange={setEffectiveUntil} min={effectiveFrom || undefined} placeholder="No end date" />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch id="wf-self" checked={allowSelfApproval} onCheckedChange={setAllowSelfApproval} />
              <Label htmlFor="wf-self">Allow submitters to approve their own content</Label>
              {sensitiveSelected && (
                <span className="text-xs text-muted-foreground">Always off for sensitive content types.</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Applies to</CardTitle>
              <CardDescription>
                Routing rules. The highest-priority matching rule wins; equally ranked matches are blocked and flagged.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRules((r) => [...r, { content_type: meta?.content_types[0]?.key ?? "post", operation: "publish", priority: 100, is_mandatory: false, is_active: true }])}
            >
              <Plus className="h-4 w-4 mr-1" /> Add rule
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.length === 0 && (
              <p className="text-sm text-muted-foreground">No rules yet — this workflow won't receive any content.</p>
            )}
            {rules.map((rule, i) => {
              const type = meta?.content_types.find((t) => t.key === rule.content_type);
              return (
                <div key={i} className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Content type</Label>
                    <Select
                      value={rule.content_type}
                      onValueChange={(v) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, content_type: v } : r)))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(meta?.content_types ?? []).map((t) => (
                          <SelectItem key={t.key} value={t.key}>
                            {t.label}
                            {t.sensitive ? " (sensitive)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {type && type.approval_mode === "off" && (
                      <p className="text-xs text-amber-600">
                        Approval is switched off for {type.label}; this rule has no effect until it is enabled.
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Priority</Label>
                    <Input
                      type="number"
                      className="w-24"
                      value={rule.priority ?? 100}
                      onChange={(e) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, priority: Number(e.target.value) } : r)))}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm pb-2">
                    <Switch
                      checked={!!rule.is_mandatory}
                      onCheckedChange={(v) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, is_mandatory: v } : r)))}
                    />
                    Mandatory
                  </label>
                  <label className="flex items-center gap-2 text-sm pb-2">
                    <Switch
                      checked={rule.is_active ?? true}
                      onCheckedChange={(v) => setRules((rs) => rs.map((r, j) => (j === i ? { ...r, is_active: v } : r)))}
                    />
                    Active
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove rule"
                    onClick={() => setRules((rs) => rs.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-base">Approval steps</CardTitle>
              <CardDescription>
                Steps run in order. Backups stay on standby until their activation condition is met.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSteps((s) => [...s, blankStep(s.length + 1)]);
                setStepsDirty(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Add step
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.key}
                draggable={!readOnly}
                onDragStart={() => setDragKey(step.key)}
                onDragEnd={() => setDragKey(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const from = steps.findIndex((s) => s.key === dragKey);
                  if (from >= 0) moveStep(from, index);
                  setDragKey(null);
                }}
                className={cn("rounded-lg border p-4 space-y-4 bg-card", dragKey === step.key && "opacity-50")}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" aria-hidden />
                  <Badge variant="secondary">Step {index + 1}</Badge>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(step.key, { name: e.target.value })}
                    className="flex-1"
                    aria-label="Step name"
                  />
                  <Button type="button" variant="ghost" size="icon" aria-label="Move up" onClick={() => moveStep(index, index - 1)} disabled={index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" aria-label="Move down" onClick={() => moveStep(index, index + 1)} disabled={index === steps.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove step"
                    disabled={steps.length === 1}
                    onClick={() => {
                      setSteps((s) => s.filter((x) => x.key !== step.key));
                      setStepsDirty(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <MultiSelect
                    label="Primary approvers"
                    options={assigneeOptions}
                    value={step.primary}
                    onValueChange={(v) => updateStep(step.key, { primary: v })}
                    placeholder="Choose roles or people"
                    searchPlaceholder="Search roles and people…"
                  />
                  <MultiSelect
                    label="Backup approvers"
                    options={assigneeOptions}
                    value={step.backup}
                    onValueChange={(v) => updateStep(step.key, { backup: v })}
                    placeholder="Choose roles or people"
                    searchPlaceholder="Search roles and people…"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Mode</Label>
                    <Select value={step.mode} onValueChange={(v) => updateStep(step.key, { mode: v as StepDraft["mode"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Any one approver</SelectItem>
                        <SelectItem value="parallel">Several approvers (quorum)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Approvals needed</Label>
                    <Input
                      type="number"
                      min={1}
                      value={step.quorum}
                      onChange={(e) => updateStep(step.key, { quorum: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SLA (hours)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={step.sla_hours ?? ""}
                      placeholder="No deadline"
                      onChange={(e) => updateStep(step.key, { sla_hours: e.target.value ? Number(e.target.value) : null })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Activate backups</Label>
                    <Select
                      value={step.backup_activation_policy ?? "on_sla"}
                      onValueChange={(v) => updateStep(step.key, { backup_activation_policy: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BACKUP_POLICIES.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={!!step.backups_count_toward_quorum}
                    onCheckedChange={(v) => updateStep(step.key, { backups_count_toward_quorum: v })}
                  />
                  Activated backups count toward the approvals needed
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </fieldset>

      {workflow?.versions && workflow.versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {workflow.versions
              .slice()
              .sort((a, b) => b.version_number - a.version_number)
              .map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span>
                    v{v.version_number} · {v.steps?.length ?? 0} step{(v.steps?.length ?? 0) === 1 ? "" : "s"}
                  </span>
                  <StatusBadge status={v.status as StatusType} />
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
