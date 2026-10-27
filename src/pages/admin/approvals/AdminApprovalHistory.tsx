import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusType } from "@/components/admin/shared/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { humanize, listRequests } from "@/services/approval.service";

export default function AdminApprovalHistory() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const status = params.get("status") || "";
  const mine = params.get("mine") === "1";

  const { data, isLoading } = useQuery({
    queryKey: ["approvals-history", status, mine],
    queryFn: () =>
      listRequests({ status: status || undefined, requester_id: mine ? user?.id : undefined, per_page: 50 }),
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Request history</h1>
        <p className="text-muted-foreground text-sm">Browse all approval requests and their lifecycle status.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["", "in_review", "changes_requested", "approved", "published", "rejected", "withdrawn"].map((s) => (
          <Button
            key={s || "all"}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => {
              const next = new URLSearchParams(params);
              if (s) next.set("status", s);
              else next.delete("status");
              setParams(next);
            }}
          >
            {s ? humanize(s) : "All"}
          </Button>
        ))}
        <Button
          size="sm"
          variant={mine ? "default" : "outline"}
          onClick={() => {
            const next = new URLSearchParams(params);
            if (mine) next.delete("mine");
            else next.set("mine", "1");
            setParams(next);
          }}
        >
          My submissions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests match these filters.</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.preview?.title || "Untitled"}</TableCell>
                    <TableCell>{row.preview?.type_label || row.content_type}</TableCell>
                    <TableCell><StatusBadge status={row.status as StatusType} /></TableCell>
                    <TableCell>{row.requester?.name || "—"}</TableCell>
                    <TableCell>{row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "—"}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/approvals/requests/${row.id}`}>Open</Link>
                      </Button>
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
