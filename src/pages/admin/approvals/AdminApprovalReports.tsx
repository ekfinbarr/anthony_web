import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { notify } from "@/lib/notify";
import { exportRequestsCsv, getReports, humanize } from "@/services/approval.service";
import { Download } from "lucide-react";

import { IsoDatePicker } from "@/components/ui/date-picker";
export default function AdminApprovalReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const filters = { from: from || undefined, to: to ? `${to} 23:59:59` : undefined };

  const { data, isLoading } = useQuery({
    queryKey: ["approvals-reports", from, to],
    queryFn: () => getReports(filters),
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRequestsCsv(filters);
    } catch (error) {
      notify.error(error, { description: "The CSV export failed." });
    } finally {
      setExporting(false);
    }
  };

  const byType = (data?.volume_by_content_type || {}) as Record<string, number>;
  const byStatus = (data?.volume_by_status || {}) as Record<string, number>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Workflow reports</h1>
          <p className="text-muted-foreground text-sm">Submission volume and outcomes from persisted approval records.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="report-from" className="text-xs">From</Label>
            <IsoDatePicker id="report-from" value={from} onChange={setFrom} max={to || undefined} placeholder="Any time" className="w-44" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="report-to" className="text-xs">To</Label>
            <IsoDatePicker id="report-to" value={to} onChange={setTo} min={from || undefined} placeholder="Today" className="w-44" />
          </div>
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading reports…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume by content type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(byType).length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              {Object.entries(byType).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{humanize(key)}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Volume by status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(byStatus).length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              {Object.entries(byStatus).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span>{humanize(key)}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
