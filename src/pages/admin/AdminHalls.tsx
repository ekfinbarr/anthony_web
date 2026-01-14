/**
 * Admin Halls & Rentals
 *
 * API-backed admin dashboard for facilities (type=hall) + facility booking requests.
 * Create/edit are dialogs to keep the existing `/admin/halls` route.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Plus, Search, MoreVertical, Edit, Trash2, Building, Users, DollarSign, Calendar, AlertCircle, CheckCircle2, XCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { KanbanBoard } from "@/components/admin/shared/KanbanBoard";
import facilityService, { Facility } from "@/services/facility.service";
import facilityBookingService, { FacilityBooking, FacilityBookingStatus } from "@/services/facilityBooking.service";

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

const AdminHalls = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"halls" | "bookings" | "kanban">("halls");

  // Halls (facilities) state
  const [hallSearchInput, setHallSearchInput] = useState("");
  const hallSearch = useDebouncedValue(hallSearchInput, 350);
  const [hallPage, setHallPage] = useState(1);
  const [hallPerPage, setHallPerPage] = useState(50); // facilities index is non-paginated; keep UI simple

  // Bookings state
  const [bookingStatus, setBookingStatus] = useState<FacilityBookingStatus | "all">("all");
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPerPage, setBookingPerPage] = useState(15);

  // Delete hall
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [hallToDelete, setHallToDelete] = useState<Facility | null>(null);

  // Booking workflow modal
  const [selectedBooking, setSelectedBooking] = useState<FacilityBooking | null>(null);
  const [isBookingActionOpen, setIsBookingActionOpen] = useState(false);
  const [bookingAction, setBookingAction] = useState<"approve" | "reject" | "cancel">("approve");
  const [bookingReason, setBookingReason] = useState("");

  const hallsQuery = useQuery({
    queryKey: ["admin-halls-facilities"],
    queryFn: () => facilityService.getByType("hall"),
  });

  const bookingsQueryParams = useMemo(() => {
    return {
      page: bookingPage,
      per_page: bookingPerPage,
      status: bookingStatus === "all" ? undefined : bookingStatus,
    };
  }, [bookingPage, bookingPerPage, bookingStatus]);

  const bookingsQuery = useQuery({
    queryKey: ["admin-facility-bookings", bookingsQueryParams],
    queryFn: () => facilityBookingService.listAdmin(bookingsQueryParams),
    placeholderData: (prev) => prev,
  });

  const halls: Facility[] = useMemo(() => {
    const list = hallsQuery.data?.data ?? [];
    if (!hallSearch) return list;
    const q = hallSearch.toLowerCase();
    return list.filter((h) => h.name.toLowerCase().includes(q) || (h.description || "").toLowerCase().includes(q));
  }, [hallsQuery.data, hallSearch]);

  const getLastPage = (res: unknown): number => {
    if (!isRecord(res)) return 1;
    const meta = res.meta;
    if (isRecord(meta) && typeof meta.last_page === "number" && Number.isFinite(meta.last_page) && meta.last_page > 0) {
      return meta.last_page;
    }
    const last = res.last_page;
    if (typeof last === "number" && Number.isFinite(last) && last > 0) return last;
    return 1;
  };

  const bookings: FacilityBooking[] = useMemo(() => {
    const data = bookingsQuery.data;
    return (isRecord(data) && Array.isArray(data.data) ? (data.data as FacilityBooking[]) : []) as FacilityBooking[];
  }, [bookingsQuery.data]);

  const totalBookingPages = getLastPage(bookingsQuery.data);
  const goCreateHall = () => navigate("/admin/halls/new");

  const deleteHallMutation = useMutation({
    mutationFn: (id: string) => facilityService.remove(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Hall deleted successfully." });
      qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
      setIsDeleteOpen(false);
      setHallToDelete(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete hall";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const bookingActionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedBooking) throw new Error("No booking selected");
      if (bookingAction === "approve") return facilityBookingService.approve(selectedBooking.id);
      if (!bookingReason.trim()) throw new Error("Reason is required");
      if (bookingAction === "reject") return facilityBookingService.reject(selectedBooking.id, { reason: bookingReason.trim() });
      return facilityBookingService.cancel(selectedBooking.id, { reason: bookingReason.trim() });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Booking updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-facility-bookings"] });
      setIsBookingActionOpen(false);
      setSelectedBooking(null);
      setBookingReason("");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update booking";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const kanbanColumns = useMemo(() => {
    return [
      { id: "pending", title: "Requested", getItems: (all: FacilityBooking[]) => all.filter((b) => b.status === "pending") },
      { id: "approved", title: "Approved", getItems: (all: FacilityBooking[]) => all.filter((b) => b.status === "approved") },
      { id: "rejected", title: "Rejected", getItems: (all: FacilityBooking[]) => all.filter((b) => b.status === "rejected") },
      { id: "cancelled", title: "Cancelled", getItems: (all: FacilityBooking[]) => all.filter((b) => b.status === "cancelled") },
    ];
  }, []);

  const formatAmount = (amount?: string | number | null) => {
    const n = amount === null || amount === undefined ? 0 : typeof amount === "string" ? Number(amount) : amount;
    if (!n) return "—";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Halls & Rentals</h1>
          <p className="text-muted-foreground mt-1">Manage parish halls, venues, and booking requests.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/halls/new">
            <Plus className="h-4 w-4" /> Add Hall
          </Link>
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v === "halls" || v === "bookings" || v === "kanban" ? v : "halls")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="halls">Halls</TabsTrigger>
          <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="halls" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search halls..."
                    className="pl-9"
                    value={hallSearchInput}
                    onChange={(e) => {
                      setHallSearchInput(e.target.value);
                      setHallPage(1);
                    }}
                  />
                </div>
                <Select value={hallPerPage.toString()} onValueChange={(v) => setHallPerPage(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Halls</CardTitle>
            </CardHeader>
            <CardContent>
              {hallsQuery.isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : hallsQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading halls</h3>
                  <p className="text-muted-foreground mb-4">
                    {hallsQuery.error instanceof Error ? hallsQuery.error.message : "An unexpected error occurred"}
                  </p>
                  <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] })}>Try Again</Button>
                </div>
              ) : halls.length === 0 ? (
                <GenericEmptyState
                  title="No halls found"
                  description={hallSearch ? "Try adjusting your search" : "Get started by adding your first hall"}
                  actionLabel="Add Hall"
                  onAction={goCreateHall}
                  icon="building"
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hall</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {halls.slice((hallPage - 1) * hallPerPage, hallPage * hallPerPage).map((h) => (
                        <TableRow key={h.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{h.name}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">{h.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {h.capacity ?? "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              {formatAmount(h.rental_fee)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={h.is_active ? "active" : "inactive"} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Hall actions">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/halls/${h.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />View
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/halls/${h.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => { setHallToDelete(h); setIsDeleteOpen(true); }}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  value={bookingStatus}
                  onValueChange={(v) => {
                    if (v === "all" || v === "pending" || v === "approved" || v === "rejected" || v === "cancelled") {
                      setBookingStatus(v);
                      setBookingPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Requested</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bookingPerPage.toString()} onValueChange={(v) => { setBookingPerPage(Number(v)); setBookingPage(1); }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
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
              <CardTitle>Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsQuery.isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : bookingsQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading booking requests</h3>
                  <p className="text-muted-foreground mb-4">
                    {bookingsQuery.error instanceof Error ? bookingsQuery.error.message : "An unexpected error occurred"}
                  </p>
                  <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-facility-bookings"] })}>Try Again</Button>
                </div>
              ) : bookings.length === 0 ? (
                <GenericEmptyState title="No booking requests" description="Booking requests will appear here" icon="calendar" />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((b) => (
                          <TableRow key={b.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{b.reference}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {b.booking_date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{b.guest_name || "—"}</div>
                                <div className="text-sm text-muted-foreground">{b.guest_email || "—"}</div>
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
                                  {b.status === "pending" ? (
                                    <>
                                      <DropdownMenuItem onClick={() => { setSelectedBooking(b); setBookingAction("approve"); setBookingReason(""); setIsBookingActionOpen(true); }}>
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Approve
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedBooking(b); setBookingAction("reject"); setBookingReason(""); setIsBookingActionOpen(true); }}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  ) : null}
                                  {b.status !== "cancelled" ? (
                                    <DropdownMenuItem onClick={() => { setSelectedBooking(b); setBookingAction("cancel"); setBookingReason(""); setIsBookingActionOpen(true); }}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Cancel
                                    </DropdownMenuItem>
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
                      Page {bookingPage} of {totalBookingPages}
                    </div>
                    <AdminPagination currentPage={bookingPage} totalPages={totalBookingPages} onPageChange={setBookingPage} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          {bookingsQuery.isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <KanbanBoard
              items={bookings}
              columns={kanbanColumns}
              isMoveAllowed={({ toColumnId }) => toColumnId !== "rejected"} // needs reason
              onMove={async ({ item, toColumnId }) => {
                setSelectedBooking(item);
                if (toColumnId === "approved") {
                  setBookingAction("approve");
                  setBookingReason("");
                  setIsBookingActionOpen(true);
                } else if (toColumnId === "cancelled") {
                  setBookingAction("cancel");
                  setBookingReason("");
                  setIsBookingActionOpen(true);
                }
              }}
              renderCard={(b) => (
                <div className="space-y-2">
                  <div className="font-medium">{b.reference}</div>
                  <div className="text-xs text-muted-foreground">{b.booking_date}</div>
                  <div className="text-xs text-muted-foreground">{b.guest_name || "—"}</div>
                </div>
              )}
            />
          )}
        </TabsContent>
      </Tabs>

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Hall"
        description="This action cannot be undone. This will permanently delete the hall."
        itemName={hallToDelete?.name}
        onConfirm={() => hallToDelete && deleteHallMutation.mutate(hallToDelete.id)}
        isLoading={deleteHallMutation.isPending}
      />

      {/* Booking action dialog */}
      <Dialog open={isBookingActionOpen} onOpenChange={setIsBookingActionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {bookingAction === "approve" ? "Approve booking" : bookingAction === "reject" ? "Reject booking" : "Cancel booking"}
            </DialogTitle>
            <DialogDescription>
              {selectedBooking ? `${selectedBooking.reference} • ${selectedBooking.booking_date}` : "Update booking status"}
            </DialogDescription>
          </DialogHeader>
          {bookingAction !== "approve" ? (
            <div className="space-y-2 py-2">
              <div className="text-sm font-medium">
                Reason <span className="text-destructive">*</span>
              </div>
              <Textarea value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} rows={4} placeholder="Write the reason..." />
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsBookingActionOpen(false)} disabled={bookingActionMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant={bookingAction === "approve" ? "default" : "destructive"}
              onClick={() => bookingActionMutation.mutate()}
              disabled={bookingActionMutation.isPending}
            >
              {bookingActionMutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHalls;
