import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAlerts, getOverview } from "@/services/approval.service";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, CheckCircle2, XCircle, AlertTriangle, Inbox, RefreshCw } from "lucide-react";

export default function AdminApprovalsOverview() {
  const { hasPermission, isAdmin } = useAuth();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["approvals-overview"],
    queryFn: getOverview,
    refetchInterval: 60_000,
  });
  const { data: alerts } = useQuery({
    queryKey: ["approvals-alerts"],
    queryFn: getAlerts,
    refetchInterval: 60_000,
  });
  const canSeeWorkflows = isAdmin() || hasPermission("view workflows", "manage workflows");
  const canSeeReports = isAdmin() || hasPermission("view approval-reports", "manage workflows");
  const conflicts = alerts?.routing_conflicts ?? [];
  const stranded = alerts?.stranded_steps ?? [];

  const cards = [
    { label: "Pending", value: data?.total_pending ?? 0, icon: Inbox, href: "/admin/approvals/history?status=in_review" },
    { label: "Awaiting me", value: data?.awaiting_my_approval ?? 0, icon: Clock, href: "/admin/approvals/queue" },
    { label: "Changes requested", value: data?.changes_requested ?? 0, icon: RefreshCw, href: "/admin/approvals/history?status=changes_requested" },
    { label: "Overdue", value: data?.overdue ?? 0, icon: AlertTriangle, href: "/admin/approvals/queue" },
    { label: "Approved", value: data?.approved ?? 0, icon: CheckCircle2, href: "/admin/approvals/history?status=approved" },
    { label: "Rejected", value: data?.rejected ?? 0, icon: XCircle, href: "/admin/approvals/history?status=rejected" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Approvals</h1>
          <p className="text-muted-foreground text-sm">
            Track pending reviews, your queue, and workflow performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/approvals/queue">My queue</Link>
          </Button>
          {canSeeWorkflows && (
            <Button variant="secondary" asChild>
              <Link to="/admin/approvals/workflows">Workflows</Link>
            </Button>
          )}
        </div>
      </div>

      {(conflicts.length > 0 || stranded.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {conflicts.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm">Routing conflicts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Equally ranked workflow rules match the same content, so submissions are blocked until one is
                  re-prioritised or deactivated.
                </p>
                <ul className="list-disc pl-5">
                  {conflicts.map((c) => (
                    <li key={`${c.content_type}-${c.operation}`}>
                      {c.content_type} · {c.operation}
                    </li>
                  ))}
                </ul>
                {canSeeWorkflows && (
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/admin/approvals/workflows">Review workflows</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          {stranded.length > 0 && (
            <Card className="border-amber-400">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm">Steps with no active approver</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="space-y-1">
                  {stranded.map((s) => (
                    <li key={s.step_instance_id}>
                      <Link to={`/admin/approvals/requests/${s.approval_request_id}`} className="underline">
                        {s.step_name}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        ({s.content_type}){s.has_standby_backups ? " — backups available to activate" : " — reassign required"}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} to={card.href}>
            <Card className="hover:border-primary/40 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{isLoading ? "—" : card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average approval duration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {data?.average_approval_hours != null ? `${data.average_approval_hours} hours` : "No completed requests yet"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/approvals/history">Request history</Link>
            </Button>
            {canSeeReports && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/approvals/reports">Reports</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
