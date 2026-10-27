/**
 * Admin inbox for guest ministry expressions of interest.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Archive, Eye, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import ministryEnquiryService, {
  EnquiryStatus,
  MinistryEnquiry,
} from "@/services/ministryEnquiry.service";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
const AdminMinistryEnquiries = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const selection = useBulkSelection<MinistryEnquiry>(rowId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MinistryEnquiry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MinistryEnquiry | null>(null);

  const params = useMemo(
    () => ({
      page,
      per_page: 20,
      search: search || undefined,
      status: status === "all" ? undefined : status,
    }),
    [page, search, status]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["ministry-enquiries", params],
    queryFn: () => ministryEnquiryService.list(params),
  });

  const enquiries = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;

  const statusMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: EnquiryStatus }) =>
      ministryEnquiryService.updateStatus(id, next),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-enquiries"] });
      toast({ title: "Updated", description: "Enquiry status updated" });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ministryEnquiryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-enquiries"] });
      setDeleteTarget(null);
      toast({ title: "Deleted", description: "Enquiry removed" });
    },
    onError: (e: Error) =>
      toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openDetails = async (enquiry: MinistryEnquiry) => {
    try {
      const res = await ministryEnquiryService.getById(enquiry.id);
      setSelected(res.data);
      qc.invalidateQueries({ queryKey: ["ministry-enquiries"] });
    } catch {
      setSelected(enquiry);
    }
  };

  const exportColumns: ExportColumn<MinistryEnquiry>[] = [
    { header: "Name", value: (e) => e.full_name, width: 26 },
    { header: "Email", value: (e) => e.email ?? "" },
    { header: "Phone", value: (e) => e.phone ?? "" },
    { header: "Ministry", value: (e) => e.ministry?.name ?? "" },
    { header: "Message", value: (e) => e.message ?? "", width: 50 },
    { header: "Status", value: (e) => e.status },
    { header: "Received", value: (e) => e.created_at, type: "datetime" },
  ];
  const fetchAllRows = () => fetchAllPages<MinistryEnquiry>((page, per_page) => ministryEnquiryService.list({ ...params, page, per_page }) as never);

  return (
    <div className="space-y-6 animate-fade-in">
      <BulkActionBar resource="ministry_enquiries" selection={selection} describe={(row) => row.full_name} noun={["enquiry", "enquiries"]} onComplete={() => qc.invalidateQueries({ queryKey: ["ministry-enquiries"] })}>
        <ExportMenu variant="bar" title="Ministry enquiries" filename="ministry-enquiries" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
      </BulkActionBar>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-heading font-bold">Ministry enquiries</h1>
        <p className="mt-1 text-muted-foreground">
          Guest expressions of interest from Serve Others. These are not membership confirmations.
        </p>
      </div>
        <ExportMenu title="Ministry enquiries" filename="ministry-enquiries" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, email, message…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as EnquiryStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Loading…</p>
          ) : error ? (
            <div className="flex flex-col items-center py-12 text-center">
              <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
              <p className="mb-4 text-muted-foreground">
                {error instanceof Error ? error.message : "Failed to load enquiries"}
              </p>
              <Button onClick={() => qc.invalidateQueries({ queryKey: ["ministry-enquiries"] })}>
                Try again
              </Button>
            </div>
          ) : enquiries.length === 0 ? (
            <GenericEmptyState
              title="No enquiries yet"
              description="Expressions of interest submitted from ministry pages will appear here."
              icon="users"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><SelectAllCheckbox selection={selection} rows={enquiries} /></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Ministry</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enquiries.map((row) => (
                      <TableRow key={row.id} data-state={selection.isSelected(row) ? "selected" : undefined}>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}><SelectRowCheckbox selection={selection} row={row} label={`Select ${row.full_name}`} /></TableCell>
                        <TableCell className="font-medium">{row.full_name}</TableCell>
                        <TableCell>{row.ministry?.name || "—"}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={
                              row.status === "new"
                                ? "pending"
                                : row.status === "archived"
                                  ? "inactive"
                                  : "completed"
                            }
                            customLabel={
                              row.status === "new"
                                ? "New"
                                : row.status === "archived"
                                  ? "Archived"
                                  : "Read"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString()
                            : "—"}
                        </TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View enquiry"
                            onClick={() => openDetails(row)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Archive enquiry"
                            onClick={() =>
                              statusMutation.mutate({ id: row.id, next: "archived" })
                            }
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete enquiry"
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.full_name}</DialogTitle>
            <DialogDescription>
              {selected?.ministry?.name
                ? `Interest in ${selected.ministry.name}`
                : "General ministry enquiry"}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a className="text-primary underline" href={`mailto:${selected.email}`}>
                  {selected.email}
                </a>
              </p>
              {selected.phone && (
                <p>
                  <span className="font-medium">Phone:</span> {selected.phone}
                </p>
              )}
              {selected.message && (
                <div>
                  <p className="font-medium">Message</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {selected.message}
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Privacy consent recorded. This enquiry is not confirmation of membership.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete enquiry?"
        description="This permanently removes the enquiry record."
      />
    </div>
  );
};

export default AdminMinistryEnquiries;
