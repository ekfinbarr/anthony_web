import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { getQueue } from "@/services/approval.service";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function AdminApprovalQueue() {
  const [includeStandby, setIncludeStandby] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["approvals-queue", includeStandby],
    queryFn: () => getQueue({ per_page: 50, include_standby: includeStandby ? "1" : "0" }),
    refetchInterval: 45_000,
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">My approval queue</h1>
          <p className="text-muted-foreground text-sm">Items assigned to you for review.</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="standby" checked={includeStandby} onCheckedChange={setIncludeStandby} />
          <Label htmlFor="standby">Show standby backups</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading queue…</p>
          ) : rows.length === 0 ? (
            <GenericEmptyState
              title="Queue is empty"
              description="You have no actionable approval assignments right now."
            />
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Waiting</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      {row.preview?.title || "Untitled"}
                      {row.my_assignment?.status === "standby" && (
                        <Badge variant="outline" className="ml-2 text-xs">Standby backup</Badge>
                      )}
                    </TableCell>
                    <TableCell>{row.preview?.type_label || row.content_type}</TableCell>
                    <TableCell>{row.requester?.name || "—"}</TableCell>
                    <TableCell>{row.current_step?.name || "—"}</TableCell>
                    <TableCell>
                      {row.submitted_at
                        ? formatDistanceToNow(new Date(row.submitted_at), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.is_sensitive ? "destructive" : "secondary"}>
                        {row.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant={row.my_assignment?.status === "standby" ? "outline" : "default"} asChild>
                        <Link to={`/admin/approvals/requests/${row.id}`}>
                          {row.my_assignment?.status === "standby" ? "View" : "Review"}
                        </Link>
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
