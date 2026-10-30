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
import { Search, MoreVertical, Eye, Trash2, Calendar, User, AlertCircle, CheckCircle2, XCircle, Plus, Download, Hourglass, Ban, CalendarClock, Mail, BellRing, RefreshCw, Layers, Church } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { downloadAuthenticatedFile } from "@/lib/downloadCsv";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { KanbanBoard, type KanbanColumn } from "@/components/admin/shared/KanbanBoard";
import { TONE_BADGE, bookingStatusMeta } from "@/lib/bookingStatus";
import { cn } from "@/lib/utils";
import massBookingService, { LaravelResourceCollection, MassBooking, MassBookingStatus } from "@/services/massBooking.service";
import MassBookingOrdersPanel from "@/pages/admin/MassBookingOrdersPanel";
import massScheduleService, { MassSchedule } from "@/services/massSchedule.service";

type BookingAction = "approve" | "reject" | "cancel";

/**
 * Moves the backend accepts (MassBookingService): pending can be approved,
 * rejected or cancelled; approved can only be cancelled; the rest are final.
 */
const ACTION_FOR_COLUMN: Partial<Record<MassBookingStatus, BookingAction>> = {
  approved: "approve",
  rejected: "reject",
  cancelled: "cancel",
};

function moveBlockedReason(from: MassBookingStatus, to: string): string | null {
  if (to === "pending") return "Bookings can't go back to Requested";
  if (to === "alternative_required") return "Propose a new time from the order review";
  if (from === "rejected" || from === "cancelled") return `${bookingStatusMeta(from).label} bookings are final`;
  if (from === "alternative_required") return "Waiting for the requester to pick a new time";
  if (from === "approved" && to === "rejected") return "Approved bookings can be cancelled, not rejected";
  return null;
}

const ACTION_COPY: Record<BookingAction, { title: string; verb: string; done: string; tone: keyof typeof TONE_BADGE }> = {
  approve: { title: "Approve this intention?", verb: "Approve", done: "approved", tone: "emerald" },
  reject: { title: "Reject this intention?", verb: "Reject", done: "rejected", tone: "rose" },
  cancel: { title: "Cancel this intention?", verb: "Cancel booking", done: "cancelled", tone: "slate" },
};

const KANBAN_KEY = "admin-mass-bookings-kanban";

const AdminMassBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"orders" | "list" | "kanban">("orders");

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<MassBookingStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<BookingAction>("approve");
  const [actionReason, setActionReason] = useState("");
  const [actionTarget, setActionTarget] = useState<MassBooking | null>(null);
  const [kanbanSearchInput, setKanbanSearchInput] = useState("");
  const kanbanSearch = useDebouncedValue(kanbanSearchInput, 350);
  const [pendingMoveId, setPendingMoveId] = useState<string | null>(null);
  const [landed, setLanded] = useState<{ id: string; celebrate: boolean } | null>(null);




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

  // The board shows every status at once, so it doesn't share the list's status filter or paging.
  const kanbanQuery = useQuery<LaravelResourceCollection<MassBooking>>({
    queryKey: [KANBAN_KEY, kanbanSearch],
    queryFn: () => massBookingService.listAdmin({ page: 1, per_page: 100, search: kanbanSearch || undefined }),
    enabled: activeTab === "kanban",
    placeholderData: (prev) => prev,
  });
  const kanbanItems: MassBooking[] = useMemo(() => kanbanQuery.data?.data ?? [], [kanbanQuery.data]);



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




  const openAction = (booking: MassBooking, type: BookingAction) => {
    setSelectedId(booking.id);
    setActionTarget(booking);
    setActionType(type);
    setActionReason("");
    setIsActionOpen(true);
  };

  const actionMutation = useMutation({
    mutationFn: async ({ id, type, reason }: { id: string; type: BookingAction; reason: string }) => {
      if (type === "approve") return massBookingService.approve(id);
      if (!reason.trim()) throw new Error("Reason is required");
      if (type === "reject") return massBookingService.reject(id, { reason: reason.trim() });
      return massBookingService.cancel(id, { reason: reason.trim() });
    },
    onMutate: async ({ id, type }) => {
      setPendingMoveId(id);
      setIsActionOpen(false);
      // Move the card straight away; roll back if the server refuses.
      await qc.cancelQueries({ queryKey: [KANBAN_KEY] });
      const snapshots = qc.getQueriesData<LaravelResourceCollection<MassBooking>>({ queryKey: [KANBAN_KEY] });
      const next: MassBookingStatus = type === "approve" ? "approved" : type === "reject" ? "rejected" : "cancelled";
      qc.setQueriesData<LaravelResourceCollection<MassBooking>>({ queryKey: [KANBAN_KEY] }, (old) =>
        old ? { ...old, data: old.data.map((b) => (b.id === id ? { ...b, status: next } : b)) } : old
      );
      return { snapshots };
    },
    onSuccess: (_res, { id, type }) => {
      const who = actionTarget?.user?.name || actionTarget?.guest_name || actionTarget?.offered_by;
      const email = actionTarget?.user?.email || actionTarget?.guest_email;
      toast({
        title: `Intention ${ACTION_COPY[type].done}`,
        description: email
          ? `${who ?? "The requester"} has been notified at ${email}.`
          : actionTarget?.order_id
            ? "The order's contact has been notified."
            : "Status updated. There's no email on file, so no email was sent.",
      });
      setLanded({ id, celebrate: type === "approve" });
      window.setTimeout(() => setLanded((cur) => (cur?.id === id ? null : cur)), 1600);
      setActionReason("");
      setActionTarget(null);
    },
    onError: (e: unknown, _vars, context) => {
      context?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
      const message = e instanceof Error ? e.message : "Failed to update booking";
      toast({ title: "Couldn't update booking", description: message, variant: "destructive" });
    },
    onSettled: (_res, _err, { id }) => {
      setPendingMoveId(null);
      qc.invalidateQueries({ queryKey: ["admin-mass-bookings"] });
      qc.invalidateQueries({ queryKey: [KANBAN_KEY] });
      qc.invalidateQueries({ queryKey: ["admin-mass-booking", id] });
      // An intention can change its order's status too.
      qc.invalidateQueries({ queryKey: ["mass-booking-orders"] });
    },
  });

  const kanbanColumns = useMemo<KanbanColumn<MassBooking>[]>(() => {
    const byStatus = (status: MassBookingStatus) => (all: MassBooking[]) => all.filter((b) => b.status === status);
    return [
      { id: "pending", title: "Requested", tone: "amber", icon: Hourglass, getItems: byStatus("pending"), emptyText: "No requests waiting. All caught up!" },
      { id: "approved", title: "Approved", tone: "emerald", icon: CheckCircle2, getItems: byStatus("approved"), emptyText: "Drag a request here to approve it" },
      { id: "alternative_required", title: "Needs new time", tone: "violet", icon: CalendarClock, getItems: byStatus("alternative_required"), helpText: "Waiting on the requester", emptyText: "No time changes pending" },
      { id: "rejected", title: "Rejected", tone: "rose", icon: XCircle, getItems: byStatus("rejected"), emptyText: "Nothing rejected" },
      { id: "cancelled", title: "Cancelled", tone: "slate", icon: Ban, getItems: byStatus("cancelled"), emptyText: "Nothing cancelled" },
    ];
  }, []);

  const actionCopy = ACTION_COPY[actionType];
  const actionEmail = actionTarget?.user?.email || actionTarget?.guest_email || null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Mass Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage Mass intention requests and bookings.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={async () => {
              try {
                await downloadAuthenticatedFile("mass-booking-orders/export", "mass-booking-orders.csv", {
                  status: statusFilter !== "all" ? statusFilter : undefined,
                  search: debouncedSearch || undefined,
                });
              } catch (e) {
                toast({
                  title: "Export failed",
                  description: e instanceof Error ? e.message : "Could not export orders",
                  variant: "destructive",
                });
              }
            }}
          >
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button onClick={() => navigate("/admin/mass-bookings/new")} className="gap-2">
            <Plus className="h-4 w-4" /> New booking
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v === "list" || v === "kanban" || v === "orders" ? v : "orders")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="list">Intentions</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <MassBookingOrdersPanel />
        </TabsContent>

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
                                      <DropdownMenuItem onClick={() => openAction(b, "approve")}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => openAction(b, "reject")}>
                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
                                  {b.status === "pending" || b.status === "approved" ? (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => openAction(b, "cancel")}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Cancel
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}
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

        <TabsContent value="kanban" className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Drag a card to another column, or use its <span className="font-medium text-foreground">→</span> menu. The requester is emailed and, if they have an account, notified on their dashboard.
            </p>
            <div className="flex gap-2">
              <div className="relative md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search intentions or donors…"
                  className="pl-9"
                  value={kanbanSearchInput}
                  onChange={(e) => setKanbanSearchInput(e.target.value)}
                  aria-label="Search the board"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => kanbanQuery.refetch()}
                disabled={kanbanQuery.isFetching}
                aria-label="Refresh board"
              >
                <RefreshCw className={cn("h-4 w-4", kanbanQuery.isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

          {kanbanQuery.isLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {kanbanColumns.map((c) => (
                <div key={c.id} className="min-w-[260px] flex-1 space-y-3 rounded-xl border p-3">
                  <Skeleton className="h-6 w-1/2" />
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ))}
            </div>
          ) : kanbanQuery.error ? (
            <div className="flex flex-col items-center justify-center rounded-xl border py-12 text-center">
              <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
              <p className="mb-3 text-sm text-muted-foreground">
                {kanbanQuery.error instanceof Error ? kanbanQuery.error.message : "Couldn't load the board."}
              </p>
              <Button onClick={() => kanbanQuery.refetch()}>Try again</Button>
            </div>
          ) : (
            <>
              <KanbanBoard
                items={kanbanItems}
                columns={kanbanColumns}
                getMoveBlockedReason={({ item, toColumnId }) => moveBlockedReason(item.status, toColumnId)}
                pendingId={pendingMoveId}
                highlightId={landed?.id ?? null}
                celebrate={landed?.celebrate}
                onCardOpen={(b) => { setSelectedId(b.id); setIsDetailsOpen(true); }}
                onMove={({ item, toColumnId }) => {
                  const action = ACTION_FOR_COLUMN[toColumnId as MassBookingStatus];
                  if (action) openAction(item, action);
                }}
                renderCard={(b) => (
                  <div className="space-y-1.5">
                    <div className="line-clamp-2 font-medium leading-snug">{b.intention}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        {b.booking_date}
                        {b.mass_schedule?.title ? ` · ${b.mass_schedule.title}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{b.user?.name || b.guest_name || b.offered_by || "—"}</span>
                    </div>
                    {b.order_id ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        <Layers className="h-3 w-3" aria-hidden /> Part of an order
                      </span>
                    ) : null}
                  </div>
                )}
              />
              {kanbanQuery.data && getLastPage(kanbanQuery.data) > 1 ? (
                <p className="text-xs text-muted-foreground">
                  Showing the 100 most recent intentions. Search to find older ones.
                </p>
              ) : null}
            </>
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

      <Dialog
        open={isActionOpen}
        onOpenChange={(open) => {
          setIsActionOpen(open);
          if (!open && !actionMutation.isPending) setActionTarget(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{actionCopy.title}</DialogTitle>
            <DialogDescription>
              {actionTarget ? (
                <span className="inline-flex items-center gap-2">
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", TONE_BADGE[bookingStatusMeta(actionTarget.status).tone])}>
                    {bookingStatusMeta(actionTarget.status).label}
                  </span>
                  →
                  <span className={cn("rounded-full border px-2 py-0.5 text-xs", TONE_BADGE[actionCopy.tone])}>
                    {bookingStatusMeta(actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "cancelled").label}
                  </span>
                </span>
              ) : (
                "Update booking status."
              )}
            </DialogDescription>
          </DialogHeader>

          {actionTarget ? (
            <div className="space-y-1 rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{actionTarget.intention}</p>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Church className="h-3.5 w-3.5" aria-hidden />
                {actionTarget.booking_date}
                {actionTarget.mass_schedule?.title ? ` · ${actionTarget.mass_schedule.title}` : ""}
              </p>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3.5 w-3.5" aria-hidden />
                {actionTarget.user?.name || actionTarget.guest_name || actionTarget.offered_by || "—"}
              </p>
            </div>
          ) : null}

          <div className="space-y-2 rounded-lg border p-3 text-sm">
            <p className="font-medium">What happens next</p>
            <ul className="space-y-1.5 text-muted-foreground">
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {actionEmail ? (
                  <span>An email goes to <span className="font-medium text-foreground">{actionEmail}</span>.</span>
                ) : actionTarget?.order_id ? (
                  <span>An email goes to the order's contact.</span>
                ) : (
                  <span>No email address on file, so no email will be sent.</span>
                )}
              </li>
              {actionTarget?.user ? (
                <li className="flex gap-2">
                  <BellRing className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>They also get a notification on their parish dashboard.</span>
                </li>
              ) : null}
              {actionTarget?.order_id ? (
                <li className="flex gap-2">
                  <Layers className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>This intention is part of an order. Once every intention in it is decided, the order's status updates and the requester gets an order summary instead.</span>
                </li>
              ) : null}
            </ul>
          </div>

          {actionType !== "approve" ? (
            <div className="space-y-2">
              <label htmlFor="booking-action-reason" className="text-sm font-medium">
                Reason <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="booking-action-reason"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={3}
                placeholder={actionType === "reject" ? "e.g. That Mass is already full. Please choose another date." : "e.g. Cancelled at the family's request."}
              />
              <p className="text-xs text-muted-foreground">The requester sees this reason.</p>
            </div>
          ) : null}

          <div className="flex flex-col justify-end gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setIsActionOpen(false)} disabled={actionMutation.isPending}>Keep as is</Button>
            <Button
              variant={actionType === "approve" ? "church" : "destructive"}
              onClick={() => selectedId && actionMutation.mutate({ id: selectedId, type: actionType, reason: actionReason })}
              disabled={actionMutation.isPending || !selectedId || (actionType !== "approve" && !actionReason.trim())}
            >
              {actionMutation.isPending ? "Saving..." : actionCopy.verb}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMassBookings;
