import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge, type StatusType } from "@/components/admin/shared/StatusBadge";
import ApprovalContentPreview from "@/components/admin/approvals/ApprovalContentPreview";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import {
  activateBackups,
  addComment,
  cancelRequest,
  decide,
  getRequest,
  humanize,
  override,
  publishApproved,
  reassign,
  resubmit,
  withdraw,
} from "@/services/approval.service";
import { getWorkflowMeta } from "@/services/workflow.service";
import { ShieldAlert } from "lucide-react";

type DialogKind = "reject" | "rmi" | "override" | "resubmit" | "reassign" | "cancel" | null;
type OverrideAction = "force_approve_step" | "force_complete" | "bypass_publish";

const OVERRIDE_ACTIONS: Array<{ value: OverrideAction; label: string; help: string }> = [
  { value: "force_approve_step", label: "Approve the current step", help: "Records your approval on this step; later steps still run." },
  { value: "force_complete", label: "Complete the whole workflow", help: "Skips all remaining steps and applies the workflow's publish behaviour." },
  { value: "bypass_publish", label: "Bypass and publish now", help: "Skips remaining steps and publishes immediately." },
];

const formatWhen = (iso?: string | null) => (iso ? format(new Date(iso), "d MMM yyyy, HH:mm") : "—");

export default function AdminApprovalRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const { isSuperAdmin, user } = useAuth();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [overrideAction, setOverrideAction] = useState<OverrideAction>("force_complete");
  const [reassignFrom, setReassignFrom] = useState("");
  const [reassignTo, setReassignTo] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["approval-request", id],
    queryFn: () => getRequest(id!),
    enabled: !!id,
    refetchInterval: 45_000,
  });
  const viewer = data?.viewer;

  const { data: meta } = useQuery({
    queryKey: ["workflow-meta"],
    queryFn: getWorkflowMeta,
    enabled: dialog === "reassign",
  });

  const closeDialog = () => {
    setDialog(null);
    setReason("");
  };

  const afterAction = (message: string) => {
    notify.success(message);
    closeDialog();
    queryClient.invalidateQueries({ queryKey: ["approval-request", id] });
    queryClient.invalidateQueries({ queryKey: ["approvals-queue"] });
    queryClient.invalidateQueries({ queryKey: ["approvals-overview"] });
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  const onError = (fallback: string) => (err: unknown) => notify.error(err, { description: fallback });

  const decideMutation = useMutation({
    mutationFn: (payload: { decision: "approve" | "reject" | "request_info"; reason?: string }) =>
      // Stable per step + person + decision so double-clicks and retries are recorded once.
      decide(id!, { ...payload, idempotency_key: `${id}:${data?.current_step?.id}:${user?.id}:${payload.decision}` }),
    onSuccess: (res) => afterAction(res.message),
    onError: onError("Your decision was not recorded."),
  });

  const overrideMutation = useMutation({
    mutationFn: () => override(id!, { action: overrideAction, reason }),
    onSuccess: (res) => afterAction(res.message),
    onError: onError("The override was not applied."),
  });

  const simple = useMutation({
    mutationFn: (kind: "withdraw" | "publish" | "backups" | "resubmit" | "cancel" | "reassign") => {
      switch (kind) {
        case "withdraw":
          return withdraw(id!);
        case "publish":
          return publishApproved(id!);
        case "backups":
          return activateBackups(id!);
        case "resubmit":
          return resubmit(id!, reason || undefined);
        case "cancel":
          return cancelRequest(id!, reason);
        case "reassign":
          return reassign(id!, { assignment_id: reassignFrom, user_id: reassignTo, reason: reason || undefined });
      }
    },
    onSuccess: (res) => afterAction(res.message),
    onError: onError("That action could not be completed."),
  });

  const commentMutation = useMutation({
    mutationFn: () => addComment(id!, comment),
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["approval-request", id] });
    },
    onError: onError("Your comment was not saved."),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading request…</p>;
  if (error || !data) return <p className="text-destructive">Unable to load this approval request.</p>;

  const currentStep = data.step_instances?.find((s) => s.id === data.current_step?.id);
  const reassignable = currentStep?.assignments.filter((a) => a.status === "pending" || a.status === "standby") ?? [];
  const payload = data.current_revision?.payload ?? {};

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 px-0">
            <Link to="/admin/approvals/queue">← Back to queue</Link>
          </Button>
          <h1 className="text-2xl font-heading font-bold">{data.preview?.title || "Approval request"}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <StatusBadge status={data.status as StatusType} />
            <Badge variant="outline">{data.preview?.type_label || data.content_type}</Badge>
            {data.is_sensitive && <Badge variant="destructive">Sensitive</Badge>}
            {data.current_revision && <Badge variant="secondary">Revision {data.current_revision.revision_number}</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewer?.can_decide && (
            <>
              <Button onClick={() => decideMutation.mutate({ decision: "approve" })} disabled={decideMutation.isPending}>
                Approve
              </Button>
              <Button variant="outline" onClick={() => setDialog("rmi")}>Request info</Button>
              <Button variant="destructive" onClick={() => setDialog("reject")}>Reject</Button>
            </>
          )}
          {viewer?.can_resubmit && <Button onClick={() => setDialog("resubmit")}>Resubmit</Button>}
          {viewer?.can_publish && (
            <Button onClick={() => simple.mutate("publish")} disabled={simple.isPending}>Publish now</Button>
          )}
          {viewer?.can_withdraw && (
            <Button variant="outline" onClick={() => simple.mutate("withdraw")} disabled={simple.isPending}>Withdraw</Button>
          )}
        </div>
      </div>

      {data.status === "changes_requested" && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="py-4 text-sm">
            A reviewer asked for changes. Edit the content
            {data.preview?.edit_url && (
              <>
                {" "}
                <Link to={data.preview.edit_url} className="underline">in its editor</Link>
              </>
            )}
            , then resubmit.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Submitted content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApprovalContentPreview payload={payload} />
            {data.preview?.edit_url && (
              <Button variant="link" className="px-0" asChild>
                <Link to={data.preview.edit_url}>Open in content editor</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Requester:</span> {data.requester?.name ?? "—"}</p>
            <p><span className="text-muted-foreground">Workflow:</span> {data.workflow?.name ?? "—"}</p>
            <p><span className="text-muted-foreground">Current step:</span> {data.current_step?.name ?? "—"}</p>
            <p><span className="text-muted-foreground">Due:</span> {formatWhen(data.current_step?.due_at)}</p>
            <p><span className="text-muted-foreground">Submitted:</span> {formatWhen(data.submitted_at)}</p>
            {viewer?.can_reassign && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => simple.mutate("backups")} disabled={simple.isPending}>
                  Activate backups now
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDialog("reassign")} disabled={reassignable.length === 0}>
                  Reassign
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Steps & approvers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.step_instances || [])
              .slice()
              .sort((a, b) => a.step_order - b.step_order)
              .map((step) => (
                <div key={step.id} className="border-l-2 pl-3 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm">{step.name}</span>
                    <Badge variant="outline">{humanize(step.status)}</Badge>
                    {step.quorum > 1 && <Badge variant="secondary">needs {step.quorum}</Badge>}
                    {step.backups_activated && <Badge variant="secondary">backups active</Badge>}
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {step.assignments.map((a) => (
                      <li key={a.id} className="flex flex-wrap items-center gap-1">
                        <span className="text-foreground">{a.user?.name || a.user_id}</span>
                        <span>· {a.tier}</span>
                        {a.source_role && <span>· via {a.source_role.replace(/_/g, " ")}</span>}
                        <span>· {humanize(a.status)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm">
              {(data.audit_events || []).map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" aria-hidden />
                  <div>
                    <p>
                      <span className="font-medium">{humanize(e.action)}</span>
                      {e.actor && <span className="text-muted-foreground"> by {e.actor.name}</span>}
                    </p>
                    {typeof e.payload?.reason === "string" && <p className="text-muted-foreground">{e.payload.reason}</p>}
                    <p className="text-xs text-muted-foreground">{formatWhen(e.created_at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decisions & comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {(data.decisions || []).map((d) => (
            <div key={d.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{humanize(d.decision)}</Badge>
                {d.is_override && <Badge variant="destructive">super-admin override</Badge>}
                <span className="text-muted-foreground">{d.actor?.name} · {formatWhen(d.created_at)}</span>
              </div>
              {d.reason && <p className="mt-1">{d.reason}</p>}
            </div>
          ))}
          {(data.comments || []).map((c) => (
            <div key={c.id} className="rounded-md bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {c.author?.name ?? "Someone"} · {c.visibility === "requester" ? "to requester" : "internal"} · {formatWhen(c.created_at)}
              </p>
              <p className="whitespace-pre-wrap">{c.body}</p>
            </div>
          ))}
          {(data.decisions || []).length === 0 && (data.comments || []).length === 0 && (
            <p className="text-muted-foreground">No decisions or comments yet.</p>
          )}
          <div className="space-y-2 pt-2">
            <Label htmlFor="comment">Add an internal comment</Label>
            <Textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button size="sm" onClick={() => commentMutation.mutate()} disabled={!comment.trim() || commentMutation.isPending}>
              Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin() && (viewer?.can_override || viewer?.can_cancel) && (
        <Card className="border-destructive/40">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Super-admin controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Overrides skip the normal approval process. Every override needs a reason, is recorded permanently and
              notifies the requester and outstanding approvers.
            </p>
            <div className="flex flex-wrap gap-2">
              {viewer?.can_override && (
                <Button variant="destructive" onClick={() => setDialog("override")}>Override…</Button>
              )}
              {viewer?.can_cancel && (
                <Button variant="outline" onClick={() => setDialog("cancel")}>Cancel request…</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog === "reject" && "Reject submission"}
              {dialog === "rmi" && "Request more information"}
              {dialog === "override" && "Super-admin override"}
              {dialog === "resubmit" && "Resubmit for approval"}
              {dialog === "reassign" && "Reassign approver"}
              {dialog === "cancel" && "Cancel this request"}
            </DialogTitle>
            {dialog === "override" && (
              <DialogDescription>{OVERRIDE_ACTIONS.find((a) => a.value === overrideAction)?.help}</DialogDescription>
            )}
            {dialog === "resubmit" && (
              <DialogDescription>Review restarts from the first step using the content as it is now.</DialogDescription>
            )}
          </DialogHeader>

          {dialog === "override" && (
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={overrideAction} onValueChange={(v) => setOverrideAction(v as OverrideAction)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OVERRIDE_ACTIONS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {dialog === "reassign" && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Take the assignment from</Label>
                <Select value={reassignFrom} onValueChange={setReassignFrom}>
                  <SelectTrigger><SelectValue placeholder="Choose an approver" /></SelectTrigger>
                  <SelectContent>
                    {reassignable.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.user?.name ?? a.user_id} ({a.tier}, {a.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Give it to</Label>
                <Select value={reassignTo} onValueChange={setReassignTo}>
                  <SelectTrigger><SelectValue placeholder="Choose a person" /></SelectTrigger>
                  <SelectContent>
                    {(meta?.users ?? []).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dialog-reason">
              {dialog === "resubmit" ? "Note to reviewers (optional)" : dialog === "reassign" ? "Reason (optional)" : "Reason (required)"}
            </Label>
            <Textarea id="dialog-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={4} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Close</Button>
            {(dialog === "reject" || dialog === "rmi") && (
              <Button
                variant={dialog === "reject" ? "destructive" : "default"}
                disabled={!reason.trim() || decideMutation.isPending}
                onClick={() => decideMutation.mutate({ decision: dialog === "reject" ? "reject" : "request_info", reason })}
              >
                {dialog === "reject" ? "Reject" : "Send request"}
              </Button>
            )}
            {dialog === "override" && (
              <Button variant="destructive" disabled={reason.trim().length < 3 || overrideMutation.isPending} onClick={() => overrideMutation.mutate()}>
                Confirm override
              </Button>
            )}
            {dialog === "cancel" && (
              <Button variant="destructive" disabled={reason.trim().length < 3 || simple.isPending} onClick={() => simple.mutate("cancel")}>
                Cancel request
              </Button>
            )}
            {dialog === "resubmit" && (
              <Button disabled={simple.isPending} onClick={() => simple.mutate("resubmit")}>Resubmit</Button>
            )}
            {dialog === "reassign" && (
              <Button disabled={!reassignFrom || !reassignTo || simple.isPending} onClick={() => simple.mutate("reassign")}>
                Reassign
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
