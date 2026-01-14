/**
 * Hall Form Page (Admin)
 *
 * Replaces the old "Hall Form" modal in AdminHalls with dedicated routes:
 * - /admin/halls/new
 * - /admin/halls/:id/edit
 *
 * UX goals:
 * - Mobile-first, scrollable sections, clear validation messaging
 * - Sticky action bar on small screens
 * - Multi-image upload with previews (uploads via Attachments API)
 *
 * Data flow (create):
 * 1) Create Facility (type="hall") WITHOUT images (or with existing URLs if any).
 * 2) Upload any pending local files via `uploadAndGetUrl` using related_type="facility" and related_id=<facility.id>.
 * 3) Update Facility.images to the final URL list.
 *
 * Data flow (edit):
 * - Save updates via PUT /api/facilities/{id}
 * - Uploading/removing images updates the form state, then we persist on Save
 *   (and we also persist immediately after modal upload/remove for safety).
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, Loader2, Plus, Save, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import facilityService, { Facility, UpsertFacilityPayload } from "@/services/facility.service";
import { uploadAndGetUrl } from "@/services/attachment.service";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import MoneyInput, { MoneyCurrency } from "@/components/forms/MoneyInput";

type PendingImage = { file: File; previewUrl: string };

const MAX_IMAGES = 12;

function buildArrayFromCsv(raw: string): string[] | null {
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

export default function HallFormPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const hallId = id ?? "";

  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState<string>("");
  const [amenitiesCsv, setAmenitiesCsv] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [bookingRequirements, setBookingRequirements] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("0");
  const [isBookable, setIsBookable] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Price
  const [currency, setCurrency] = useState<MoneyCurrency>("NGN");
  const [rentalFee, setRentalFee] = useState<number | null>(null);

  // Images:
  // - `imageUrls` are already-uploaded public URLs we will persist to Facility.images
  // - `pendingImages` are local files waiting to be uploaded via the Attachments API
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);

  const hallQuery = useQuery<{ data: Facility }>({
    queryKey: ["admin-hall", hallId],
    queryFn: () => facilityService.getById(hallId),
    enabled: isEdit && !!hallId,
  });

  // Initialize from backend
  useEffect(() => {
    if (!hallQuery.data?.data) return;
    const h = hallQuery.data.data;
    // Avoid synchronous setState inside an effect body (repo lint rule).
    const t = window.setTimeout(() => {
      setName(h.name ?? "");
      setDescription(h.description ?? "");
      setCapacity(h.capacity === null || h.capacity === undefined ? "" : String(h.capacity));
      setRentalFee(h.rental_fee === null || h.rental_fee === undefined ? null : Number(h.rental_fee));
      setAmenitiesCsv(Array.isArray(h.amenities) ? h.amenities.join(", ") : "");
      setAvailabilityNotes(h.availability_notes ?? "");
      setBookingRequirements(h.booking_requirements ?? "");
      setIsBookable(Boolean(h.is_bookable));
      setIsActive(Boolean(h.is_active));
      setSortOrder(h.sort_order === null || h.sort_order === undefined ? "0" : String(h.sort_order));
      setImageUrls(Array.isArray(h.images) ? h.images.filter(Boolean) : []);

      // We keep currency UI-only (Facility has no currency column).
      setCurrency("NGN");
    }, 0);
    return () => window.clearTimeout(t);
  }, [hallQuery.data]);

  // Cleanup object URLs to avoid leaking browser memory
  useEffect(() => {
    return () => {
      pendingImages.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [pendingImages]);

  const canSubmit = useMemo(() => Boolean(name.trim() && description.trim()), [name, description]);

  const addPendingFiles = (files: FileList | null) => {
    if (!files || !files.length) return;
    const next: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      next.push({ file, previewUrl: URL.createObjectURL(file) });
    }

    setPendingImages((prev) => {
      const merged = [...prev, ...next];
      return merged.slice(0, MAX_IMAGES);
    });
  };

  const removePendingAt = (idx: number) => {
    setPendingImages((prev) => {
      const next = [...prev];
      const removed = next.splice(idx, 1)[0];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const removeImageUrlAt = async (idx: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
    // In edit mode, persist immediately so the user doesn't lose work.
    if (isEdit && hallId) {
      const nextUrls = imageUrls.filter((_, i) => i !== idx);
      try {
        await facilityService.update(hallId, { images: nextUrls });
        qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
      } catch {
        // No toast here; Save will still persist later. Keep UX calm.
      }
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: UpsertFacilityPayload = {
        name: name.trim(),
        description: description.trim(),
        type: "hall",
        capacity: capacity ? Number(capacity) : null,
        rental_fee: rentalFee === null || rentalFee === undefined ? null : rentalFee,
        amenities: buildArrayFromCsv(amenitiesCsv),
        images: imageUrls.length ? imageUrls : null,
        availability_notes: availabilityNotes.trim() || null,
        booking_requirements: bookingRequirements.trim() || null,
        is_bookable: isBookable,
        is_active: isActive,
        sort_order: Number(sortOrder || 0),
      };

      // 1) Create/Update the hall
      const res = isEdit ? await facilityService.update(hallId, payload) : await facilityService.create(payload);
      const saved = res.data;

      // 2) Upload pending images (if any) and update Facility.images with the final URL list.
      if (pendingImages.length) {
        const uploadedUrls: string[] = [];
        for (const p of pendingImages) {
          const out = await uploadAndGetUrl({
            file: p.file,
            related_type: "facility",
            related_id: saved.id,
          });
          uploadedUrls.push(out.url);
        }

        const finalUrls = [...(imageUrls ?? []), ...uploadedUrls].slice(0, MAX_IMAGES);
        await facilityService.update(saved.id, { images: finalUrls });

        setImageUrls(finalUrls);
        setPendingImages([]);
      }

      return saved;
    },
    onSuccess: async (saved) => {
      toast({ title: "Saved", description: "Hall saved successfully." });
      await qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
      navigate("/admin/halls");
      // Also invalidate potential detail cache
      qc.invalidateQueries({ queryKey: ["admin-hall", saved.id] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to save hall";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const isBusy = hallQuery.isLoading || saveMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Link to="/admin/halls" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Halls & Rentals
          </Link>
          <h1 className="text-2xl font-heading font-bold text-church-charcoal">
            {isEdit ? "Edit Hall" : "New Hall"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep details clear and friendly—this information appears on the Rentals page.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Button variant="outline" asChild disabled={isBusy}>
            <Link to="/admin/halls">Cancel</Link>
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={!canSubmit || isBusy} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Parish Hall" />
              </div>

              <div className="space-y-2">
                <Label>
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Short, clear description of the hall."
                />
              </div>
            </CardContent>
          </Card>

          {/* Capacity + price */}
          <Card>
            <CardHeader>
              <CardTitle>Capacity & pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 250" inputMode="numeric" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Rental fee (price)</Label>
                <MoneyInput
                  value={rentalFee}
                  onValueChange={setRentalFee}
                  currency={currency}
                  onCurrencyChange={setCurrency}
                />
                <p className="text-xs text-muted-foreground">
                  Note: currently we store only the numeric amount on the backend (currency is UI-only).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Upload and preview</p>
                  <p className="text-xs text-muted-foreground">
                    Add multiple images and preview them before saving. Max {MAX_IMAGES}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAttachmentModalOpen(true)}
                    disabled={!isEdit || isBusy}
                    className="gap-2"
                    title={!isEdit ? "Save the hall first, then upload images" : undefined}
                  >
                    <Upload className="h-4 w-4" />
                    Upload (modal)
                  </Button>

                  <Button type="button" variant="outline" className="gap-2" asChild>
                    <Label className="cursor-pointer">
                      <Plus className="h-4 w-4" />
                      Add files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => addPendingFiles(e.target.files)}
                      />
                    </Label>
                  </Button>
                </div>
              </div>

              {/* Previews */}
              {imageUrls.length === 0 && pendingImages.length === 0 ? (
                <div className="rounded-lg border bg-muted/30 p-6 text-center">
                  <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No images yet. Add a few to make this hall attractive.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {imageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="group relative overflow-hidden rounded-xl border bg-muted/30">
                      <img src={url} alt={`Hall image ${idx + 1}`} className="h-44 w-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeImageUrlAt(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {pendingImages.map((p, idx) => (
                    <div key={`${p.previewUrl}-${idx}`} className="group relative overflow-hidden rounded-xl border bg-muted/30">
                      <img src={p.previewUrl} alt={`Pending upload ${idx + 1}`} className="h-44 w-full object-cover" loading="lazy" />
                      <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                        Pending
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removePendingAt(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!isEdit && pendingImages.length ? (
                <p className="text-xs text-muted-foreground">
                  You’re creating a new hall: pending images will be uploaded right after you click Save.
                </p>
              ) : null}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Amenities (comma-separated)</Label>
                <Input value={amenitiesCsv} onChange={(e) => setAmenitiesCsv(e.target.value)} placeholder="wifi, parking, security" />
              </div>

              <div className="space-y-2">
                <Label>Availability notes</Label>
                <Textarea value={availabilityNotes} onChange={(e) => setAvailabilityNotes(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Booking requirements</Label>
                <Textarea value={bookingRequirements} onChange={(e) => setBookingRequirements(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Bookable</p>
                  <p className="text-xs text-muted-foreground">Can be requested for booking.</p>
                </div>
                <Switch checked={isBookable} onCheckedChange={setIsBookable} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Visible to visitors.</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>

              <div className="space-y-2">
                <Label>Sort order</Label>
                <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>- Use 3–6 bright photos (daylight preferred).</p>
              <p>- Keep description short; put details in “Booking requirements”.</p>
              <p>- Put important rules (time limits, deposits) in requirements.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      <div className="sticky bottom-3 z-10 sm:hidden">
        <div className="rounded-xl border bg-background/90 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="w-full" disabled={isBusy}>
              <Link to="/admin/halls">Cancel</Link>
            </Button>
            <Button className="w-full gap-2" onClick={() => saveMutation.mutate()} disabled={!canSubmit || isBusy}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Attachment modal (single upload, beautiful UX). Enabled only after the hall exists (edit mode). */}
      <AttachmentUploadModal
        open={isAttachmentModalOpen}
        onOpenChange={setIsAttachmentModalOpen}
        title="Upload hall image"
        description="Upload an image for this hall. After upload, it will be added to the gallery list."
        relatedType="facility"
        relatedId={hallId}
        kinds={["image"]}
        allowUrlPaste={false}
        onUploaded={async (url) => {
          const next = [...imageUrls, url].slice(0, MAX_IMAGES);
          setImageUrls(next);

          // Persist immediately (best UX: user doesn’t lose the image if they navigate away).
          if (isEdit && hallId) {
            await facilityService.update(hallId, { images: next });
            qc.invalidateQueries({ queryKey: ["admin-halls-facilities"] });
            qc.invalidateQueries({ queryKey: ["admin-hall", hallId] });
          }
        }}
      />
    </div>
  );
}


