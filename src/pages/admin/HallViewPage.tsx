/**
 * Hall View Page (Admin)
 *
 * Dedicated view route for a single hall:
 * - /admin/halls/:id
 *
 * Why a page?
 * - Gives admins a clean "details" screen (better than a cramped dropdown/modal).
 * - Lets us present images + key stats + quick actions + related bookings in a friendly layout.
 */

import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Edit, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useToast } from "@/hooks/use-toast";

import facilityService, { Facility } from "@/services/facility.service";
import facilityBookingService, { FacilityBooking, FacilityBookingStatus } from "@/services/facilityBooking.service";

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
const getLastPage = (res: unknown): number => {
  if (!isRecord(res)) return 1;
  const meta = res.meta;
  if (isRecord(meta) && typeof meta.last_page === "number" && Number.isFinite(meta.last_page) && meta.last_page > 0) {
    return meta.last_page;
  }
  return 1;
};

function formatAmount(amount?: string | number | null) {
  const n = amount === null || amount === undefined ? 0 : typeof amount === "string" ? Number(amount) : amount;
  if (!n) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(n);
}

export default function HallViewPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const hallId = id ?? "";

  // Gallery lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Bookings
  const [statusFilter, setStatusFilter] = useState<FacilityBookingStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Deletion
  const [deleteOpen, setDeleteOpen] = useState(false);

  const hallQuery = useQuery<{ data: Facility }>({
    queryKey: ["admin-hall", hallId],
    queryFn: () => facilityService.getById(hallId),
    enabled: !!hallId,
  });

  const hall = hallQuery.data?.data ?? null;
  const images = useMemo(() => (hall?.images ?? []).filter(Boolean), [hall?.images]);

  const bookingsQueryParams = useMemo(() => {
    return {
      page,
      per_page: perPage,
      facility_id: hallId,
      status: statusFilter === "all" ? undefined : statusFilter,
    };
  }, [page, perPage, hallId, statusFilter]);

  const bookingsQuery = useQuery({
    queryKey: ["admin-facility-bookings", "for-hall", bookingsQueryParams],
    queryFn: () => facilityBookingService.listAdmin(bookingsQueryParams),
    enabled: !!hallId,
    placeholderData: (prev) => prev,
  });

  const bookings: FacilityBooking[] = useMemo(() => {
    const data = bookingsQuery.data;
    return isRecord(data) && Array.isArray(data.data) ? (data.data as FacilityBooking[]) : [];
  }, [bookingsQuery.data]);

  const totalPages = getLastPage(bookingsQuery.data);

  const toggleMutation = useMutation({
    mutationFn: async (patch: Partial<Pick<Facility, "is_active" | "is_bookable">>) => {
      if (!hallId) throw new Error("Missing hall id");
      return facilityService.update(hallId, patch);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-hall", hallId] });
      await qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
      toast({ title: "Updated", description: "Hall settings updated." });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to update hall";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!hallId) throw new Error("Missing hall id");
      return facilityService.remove(hallId);
    },
    onSuccess: async () => {
      toast({ title: "Deleted", description: "Hall deleted successfully." });
      await qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
      navigate("/admin/halls");
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to delete hall";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  if (hallQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (hallQuery.error || !hall) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">Hall not found or failed to load.</p>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link to="/admin/halls">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Link to="/admin/halls" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Halls & Rentals
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-heading font-bold text-church-charcoal">{hall.name}</h1>
            {hall.is_active ? <Badge variant="secondary">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
            {hall.is_bookable ? <Badge>Bookable</Badge> : <Badge variant="outline">Not bookable</Badge>}
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">{hall.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/halls/${hall.id}/edit`}>
              <Edit className="h-4 w-4" /> Edit
            </Link>
          </Button>
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Image gallery */}
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  {images.length === 0 ? (
                    <div className="rounded-lg border bg-muted/30 p-6 text-center">
                      <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">No images yet. Add some from the Edit page.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {images.map((url, idx) => (
                        <button
                          key={`${url}-${idx}`}
                          type="button"
                          onClick={() => {
                            setLightboxUrl(url);
                            setLightboxOpen(true);
                          }}
                          className="group relative overflow-hidden rounded-xl border bg-muted/30 text-left"
                        >
                          <img src={url} alt={`Hall image ${idx + 1}`} className="h-44 w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Key details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{hall.capacity ?? "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rental fee</span>
                      <span className="font-medium">{formatAmount(hall.rental_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sort order</span>
                      <span className="font-medium">{hall.sort_order ?? 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hall.amenities && hall.amenities.length ? (
                      <div className="flex flex-wrap gap-2">
                        {hall.amenities.map((a) => (
                          <Badge key={a} variant="secondary" className="capitalize">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No amenities listed.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {hall.availability_notes || hall.booking_requirements ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Notes & requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hall.availability_notes ? (
                      <div>
                        <p className="text-sm font-medium">Availability notes</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{hall.availability_notes}</p>
                      </div>
                    ) : null}
                    {hall.booking_requirements ? (
                      <div>
                        <p className="text-sm font-medium">Booking requirements</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{hall.booking_requirements}</p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="bookings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Select
                        value={statusFilter}
                        onValueChange={(v) => {
                          if (v === "all" || v === "pending" || v === "approved" || v === "rejected" || v === "cancelled") {
                            setStatusFilter(v);
                            setPage(1);
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

                      <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Page size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Filtered to this hall
                    </div>
                  </div>

                  {bookingsQuery.isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : bookingsQuery.error ? (
                    <div className="rounded-lg border p-4 text-sm text-destructive">Failed to load bookings.</div>
                  ) : bookings.length === 0 ? (
                    <div className="rounded-lg border bg-muted/30 p-6 text-center">
                      <p className="text-sm text-muted-foreground">No bookings found for the selected filter.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((b) => (
                        <div key={b.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{b.reference}</p>
                              <p className="text-xs text-muted-foreground">
                                {b.booking_date} • {b.start_time} - {b.end_time} • {b.guest_name || "—"}
                              </p>
                            </div>
                            <StatusBadge
                              status={b.status === "approved" ? "active" : b.status === "rejected" || b.status === "cancelled" ? "cancelled" : "pending"}
                              customLabel={b.status}
                            />
                          </div>
                          {b.purpose ? <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{b.purpose}</p> : null}
                        </div>
                      ))}
                    </div>
                  )}

                  {totalPages > 1 ? (
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                      <AdminPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Quick actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Visible to visitors.</p>
                </div>
                <Switch
                  checked={Boolean(hall.is_active)}
                  onCheckedChange={(v) => toggleMutation.mutate({ is_active: v })}
                  disabled={toggleMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Bookable</p>
                  <p className="text-xs text-muted-foreground">Can be requested for booking.</p>
                </div>
                <Switch
                  checked={Boolean(hall.is_bookable)}
                  onCheckedChange={(v) => toggleMutation.mutate({ is_bookable: v })}
                  disabled={toggleMutation.isPending}
                />
              </div>

              {toggleMutation.isPending ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black">
          {lightboxUrl ? <img src={lightboxUrl} alt="Hall image" className="w-full h-full object-contain" /> : null}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Hall"
        description="This action cannot be undone. This will permanently delete the hall."
        itemName={hall.name}
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}


