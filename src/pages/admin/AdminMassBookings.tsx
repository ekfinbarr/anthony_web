/**
 * Admin Mass Bookings
 *
 * API-backed admin workflow with list + Kanban + create booking (guest flow).
 * Keeps the existing `/admin/mass-bookings` route (dialogs only).
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical, Eye, Trash2, Calendar, User, AlertCircle, CheckCircle2, XCircle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { KanbanBoard } from "@/components/admin/shared/KanbanBoard";
import massBookingService, { LaravelResourceCollection, MassBooking, MassBookingStatus } from "@/services/massBooking.service";
import massScheduleService, { MassSchedule } from "@/services/massSchedule.service";

const AdminMassBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"list" | "kanban">("list");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<MassBookingStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "cancel">("approve");
  const [actionReason, setActionReason] = useState("");




  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      per_page: pageSize,
      status: statusFilter === "all" ? undefined : statusFilter,
      search: debouncedSearch || undefined,
    };
  }, [currentPage, pageSize, statusFilter, debouncedSearch]);

  const listQuery = useQuery<LaravelResourceCollection<MassBooking>>({
    queryKey: ["admin-mass-bookings", queryParams],
    queryFn: () => massBookingService.listAdmin(queryParams),
    placeholderData: (prev) => prev,
  });

  const detailsQuery = useQuery<{ data: MassBooking }>({
    queryKey: ["admin-mass-booking", selectedId],
    queryFn: () => massBookingService.getAdminById(selectedId!),
    enabled: Boolean(selectedId) && isDetailsOpen,
  });



  type UnknownRecord = Record<string, unknown>;
  const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
  const getLastPage = (collection: unknown): number => {
    if (!isRecord(collection)) return 1;
    const meta = collection.meta;
    if (!isRecord(meta)) return 1;
    const last = meta.last_page;
    return typeof last === "number" && Number.isFinite(last) && last > 0 ? last : 1;
  };

  const bookings: MassBooking[] = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const totalPages = getLastPage(listQuery.data);

  const selectedBooking: MassBooking | null = detailsQuery.data?.data ?? null;




  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("No booking selected");
      if (actionType === "approve") return massBookingService.approve(selectedId);
      if (!actionReason.trim()) throw new Error("Reason is required");
      if (actionType === "reject") return massBookingService.reject(selectedId, { reason: actionReason.trim() });
      return massBookingService.cancel(selectedId, { reason: actionReason.trim() });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Booking updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-mass-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-mass-booking", selectedId] });
      setIsActionOpen(false);
      setActionReason("");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update booking";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const kanbanColumns = useMemo(() => {
    return [
      { id: "pending", title: "Requested", getItems: (all: MassBooking[]) => all.filter((b) => b.status === "pending") },
      { id: "approved", title: "Approved", getItems: (all: MassBooking[]) => all.filter((b) => b.status === "approved") },
      { id: "rejected", title: "Rejected", getItems: (all: MassBooking[]) => all.filter((b) => b.status === "rejected") },
      { id: "cancelled", title: "Cancelled", getItems: (all: MassBooking[]) => all.filter((b) => b.status === "cancelled") },
    ];
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Mass Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage Mass intention requests and bookings.</p>
        </div>
        <Button onClick={() => navigate("/admin/mass-bookings/new")} className="gap-2">
          <Plus className="h-4 w-4" /> Add Booking
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v === "list" || v === "kanban" ? v : "list")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by intention or donor..."
                    className="pl-9"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    if (v === "all" || v === "pending" || v === "approved" || v === "rejected" || v === "cancelled") {
                      setStatusFilter(v);
                      setCurrentPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Page size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="15">15 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {listQuery.isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : listQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading bookings</h3>
                  <p className="text-muted-foreground mb-4">
                    {listQuery.error instanceof Error ? listQuery.error.message : "An unexpected error occurred"}
                  </p>
                  <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-mass-bookings"] })}>Try Again</Button>
                </div>
              ) : bookings.length === 0 ? (
                <GenericEmptyState title="No bookings found" description="Mass booking requests will appear here" icon="church" />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Donor</TableHead>
                          <TableHead>Intention</TableHead>
                          <TableHead>Requested date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((b) => (
                          <TableRow key={b.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{b.guest_name || b.offered_by || "—"}</div>
                                  <div className="text-sm text-muted-foreground">{b.guest_email || "—"}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{b.intention}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {b.booking_date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={b.status === "approved" ? "active" : b.status === "rejected" || b.status === "cancelled" ? "cancelled" : "pending"}
                                customLabel={b.status}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Booking actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  <DropdownMenuItem onClick={() => { setSelectedId(b.id); setIsDetailsOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                  </DropdownMenuItem>
                                  {b.status === "pending" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => { setSelectedId(b.id); setActionType("approve"); setIsActionOpen(true); setActionReason(""); }}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedId(b.id); setActionType("reject"); setIsActionOpen(true); setActionReason(""); }}>
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                  {b.status !== "cancelled" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => { setSelectedId(b.id); setActionType("cancel"); setIsActionOpen(true); setActionReason(""); }}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Cancel
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedId(b.id); setIsDeleteOpen(true); }}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete (UI)
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          {listQuery.isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <KanbanBoard
              items={bookings}
              columns={kanbanColumns}
              isMoveAllowed={({ toColumnId }) => toColumnId !== "rejected"} // require reason in modal
              onMove={async ({ item, toColumnId }) => {
                setSelectedId(item.id);
                if (toColumnId === "approved") {
                  setActionType("approve");
                  setIsActionOpen(true);
                  return;
                }
                if (toColumnId === "cancelled") {
                  setActionType("cancel");
                  setIsActionOpen(true);
                  return;
                }
              }}
              renderCard={(b) => (
                <div className="space-y-2">
                  <div className="font-medium line-clamp-2">{b.intention}</div>
                  <div className="text-xs text-muted-foreground">{b.booking_date}</div>
                  <div className="text-xs text-muted-foreground">{b.guest_name || b.offered_by || "—"}</div>
                </div>
              )}
            />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDetailsOpen} onOpenChange={(open) => { setIsDetailsOpen(open); if (!open) setSelectedId(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>{selectedBooking ? selectedBooking.reference : "Loading..."}</DialogDescription>
          </DialogHeader>
          {detailsQuery.isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedBooking ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <StatusBadge
                    status={selectedBooking.status === "approved" ? "active" : selectedBooking.status === "rejected" || selectedBooking.status === "cancelled" ? "cancelled" : "pending"}
                    customLabel={selectedBooking.status}
                  />
                </div>
                <div className="text-sm text-muted-foreground">{selectedBooking.booking_date}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-sm text-muted-foreground mb-1">Intention</div>
                <div className="font-medium">{selectedBooking.intention}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Donor</div>
                  <div className="font-medium">{selectedBooking.guest_name || selectedBooking.offered_by || "—"}</div>
                  <div className="text-sm text-muted-foreground">{selectedBooking.guest_email || "—"}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Mass schedule</div>
                  <div className="font-medium">{selectedBooking.mass_schedule?.title || "—"}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBooking.mass_schedule ? `${selectedBooking.mass_schedule.day_of_week} • ${selectedBooking.mass_schedule.start_time}` : ""}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Booking not found.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve booking" : actionType === "reject" ? "Reject booking" : "Cancel booking"}
            </DialogTitle>
            <DialogDescription>Update booking status. Rejections/cancellations require a reason.</DialogDescription>
          </DialogHeader>
          {actionType !== "approve" ? (
            <div className="space-y-2 py-2">
              <div className="text-sm font-medium">
                Reason <span className="text-destructive">*</span>
              </div>
              <Textarea value={actionReason} onChange={(e) => setActionReason(e.target.value)} rows={4} placeholder="Write the reason..." />
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsActionOpen(false)} disabled={actionMutation.isPending}>Cancel</Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => actionMutation.mutate()}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>



      {/* Delete modal is kept for consistency but backend delete is not exposed for bookings */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Booking"
        description="Backend delete is not available for bookings. Use Cancel to invalidate a booking instead."
        itemName={selectedBooking?.reference || "Booking"}
        onConfirm={() => {
          toast({ title: "Not supported", description: "Use Cancel to invalidate a booking.", variant: "destructive" });
          setIsDeleteOpen(false);
        }}
        isLoading={false}
      />
    </div>
  );
};

export default AdminMassBookings;
