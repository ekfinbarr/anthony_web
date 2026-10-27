import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { StatusBadge, type StatusType } from "@/components/admin/shared/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
import {
  activateWorkflow,
  archiveWorkflow,
  deactivateWorkflow,
  duplicateWorkflow,
  getWorkflowMeta,
  listWorkflows,
} from "@/services/workflow.service";
import { MoreHorizontal, Plus } from "lucide-react";

export default function AdminWorkflows() {
  const { hasPermission, isAdmin } = useAuth();
  const canManage = isAdmin() || hasPermission("manage workflows");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["workflows", search],
    queryFn: () => listWorkflows({ search: search || undefined, per_page: 50 }),
  });
  const { data: meta } = useQuery({ queryKey: ["workflow-meta"], queryFn: getWorkflowMeta });

  const typeLabel = (key: string) => meta?.content_types.find((t) => t.key === key)?.label ?? key;

  const action = useMutation({
    mutationFn: ({ id, kind }: { id: string; kind: "activate" | "deactivate" | "duplicate" | "archive" }) => {
      switch (kind) {
        case "activate":
          return activateWorkflow(id);
        case "deactivate":
          return deactivateWorkflow(id);
        case "duplicate":
          return duplicateWorkflow(id);
        case "archive":
          return archiveWorkflow(id);
      }
    },
    onSuccess: (res, vars) => {
      notify.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      if (vars.kind === "duplicate") navigate(`/admin/approvals/workflows/${res.data.id}`);
    },
    onError: (error) => notify.error(error, { description: "The workflow action could not be completed." }),
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Workflow management</h1>
          <p className="text-muted-foreground text-sm">
            Define who reviews which content, in what order, and who steps in as backup.
          </p>
        </div>
        {canManage && (
          <Button asChild>
            <Link to="/admin/approvals/workflows/new">
              <Plus className="h-4 w-4 mr-2" />
              New workflow
            </Link>
          </Button>
        )}
      </div>

      {meta && !meta.workflow_enabled && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-4 text-sm">
            The approval engine is switched off (<code>WORKFLOW_ENABLED=false</code>). Workflows can be edited but
            nothing is routed for review until it is turned on.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">Workflows</CardTitle>
          <Input
            placeholder="Search workflows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading workflows…</p>
          ) : rows.length === 0 ? (
            <GenericEmptyState
              title="No workflows yet"
              description="Create a workflow to start routing content for review."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Applies to</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active version</TableHead>
                    <TableHead>Publishing</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((wf) => (
                    <TableRow key={wf.id}>
                      <TableCell>
                        <Link to={`/admin/approvals/workflows/${wf.id}`} className="font-medium hover:underline">
                          {wf.name}
                        </Link>
                        {wf.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{wf.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(wf.rules ?? []).map((r) => (
                            <Badge key={r.id ?? r.content_type} variant="outline" className="text-xs">
                              {typeLabel(r.content_type)}
                              {r.is_mandatory ? " · mandatory" : ""}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={wf.status as StatusType} customLabel={wf.status === "inactive" ? "Inactive" : undefined} />
                      </TableCell>
                      <TableCell>{wf.active_version ? `v${wf.active_version.version_number}` : "—"}</TableCell>
                      <TableCell className="capitalize">{wf.publish_behavior}</TableCell>
                      <TableCell className="text-right">
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Workflow actions">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/approvals/workflows/${wf.id}`)}>
                                Edit
                              </DropdownMenuItem>
                              {wf.status !== "active" && wf.status !== "archived" && (
                                <DropdownMenuItem onClick={() => action.mutate({ id: wf.id, kind: "activate" })}>
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {wf.status === "active" && (
                                <DropdownMenuItem onClick={() => action.mutate({ id: wf.id, kind: "deactivate" })}>
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => action.mutate({ id: wf.id, kind: "duplicate" })}>
                                Duplicate
                              </DropdownMenuItem>
                              {wf.status !== "archived" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => action.mutate({ id: wf.id, kind: "archive" })}
                                >
                                  Archive
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
