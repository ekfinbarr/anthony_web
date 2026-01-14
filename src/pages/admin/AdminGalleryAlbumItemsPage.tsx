/**
 * Admin Gallery Album Items Page
 *
 * Dedicated route for managing a single album's items:
 * - Upload new item (multipart + metadata)
 * - List existing items
 * - Delete items
 *
 * Route:
 * - /admin/gallery/albums/:albumId
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Image as ImageIcon, Play, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { useToast } from "@/hooks/use-toast";

import categoryService from "@/services/category.service";
import tagService from "@/services/tag.service";
import galleryAlbumService, { GalleryAlbum, GalleryAlbumItem } from "@/services/galleryAlbum.service";

type ItemDraft = {
  title: string;
  description: string;
  is_published: boolean;
  sort_order: number;
  category_ids: string[];
  tag_ids: string[];
  file: File | null;
};

const emptyItemDraft = (): ItemDraft => ({
  title: "",
  description: "",
  is_published: true,
  sort_order: 0,
  category_ids: [],
  tag_ids: [],
  file: null,
});

function toOptions(items: { id: string; label: string; slug?: string; color?: string | null }[]): MultiSelectOption[] {
  return items.map((i) => ({
    value: i.id,
    label: i.label,
    description: i.slug ? `/${i.slug}` : undefined,
  }));
}

export default function AdminGalleryAlbumItemsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { albumId } = useParams<{ albumId: string }>();
  const safeAlbumId = albumId ?? "";

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", "active"],
    queryFn: () => categoryService.list({ active: true }),
  });

  const { data: tagsData } = useQuery({
    queryKey: ["tags", "active"],
    queryFn: () => tagService.list({ active: true }),
  });

  const categoryOptions = useMemo(() => toOptions(categoriesData?.data ?? []), [categoriesData]);
  const tagOptions = useMemo(() => toOptions(tagsData?.data ?? []), [tagsData]);

  const albumQuery = useQuery<{ data: GalleryAlbum }>({
    queryKey: ["gallery-albums", safeAlbumId, "admin-show"],
    queryFn: () => galleryAlbumService.getAdminAlbum(safeAlbumId),
    enabled: !!safeAlbumId,
  });

  const album = albumQuery.data?.data ?? null;

  const itemsQuery = useQuery({
    queryKey: ["gallery-albums", safeAlbumId, "items", "admin"],
    queryFn: () => galleryAlbumService.listAdminAlbumItems(safeAlbumId, { per_page: 200 }),
    enabled: !!safeAlbumId,
  });

  const items: GalleryAlbumItem[] = itemsQuery.data?.data ?? [];

  const [draft, setDraft] = useState<ItemDraft>(emptyItemDraft());
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbumItem | null>(null);

  const createItemMutation = useMutation({
    mutationFn: async () => {
      if (!safeAlbumId) throw new Error("Missing album id");
      if (!draft.file) throw new Error("Please select a file");
      if (!draft.title.trim()) throw new Error("Title is required");

      return await galleryAlbumService.createAlbumItem(safeAlbumId, {
        title: draft.title.trim(),
        description: draft.description.trim() ? draft.description.trim() : null,
        file: draft.file,
        is_published: draft.is_published,
        sort_order: draft.sort_order,
        category_ids: draft.category_ids,
        tag_ids: draft.tag_ids,
      });
    },
    onSuccess: async () => {
      toast({ title: "Success", description: "Album item uploaded." });
      setDraft(emptyItemDraft());
      await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "items", "admin"] });
      await qc.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
      await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "admin-show"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!safeAlbumId) throw new Error("Missing album id");
      return await galleryAlbumService.deleteAlbumItem(safeAlbumId, itemId);
    },
    onSuccess: async () => {
      toast({ title: "Deleted", description: "Item removed from album." });
      setDeleteTarget(null);
      await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "items", "admin"] });
      await qc.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
      await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "admin-show"] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link to="/admin/gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery Albums
          </Link>
          <h1 className="text-2xl font-heading font-bold text-church-charcoal">
            {albumQuery.isLoading ? "Loading album…" : album?.title ?? "Album"}
          </h1>
          {album?.description ? <p className="text-sm text-muted-foreground">{album.description}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            {album?.is_featured ? <Badge>Featured</Badge> : null}
            {album?.is_published ? <Badge variant="secondary">Published</Badge> : <Badge variant="outline">Unpublished</Badge>}
          </div>
        </div>
      </div>

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a new item</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>File</Label>
            <Input
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={(e) => setDraft((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-muted-foreground">Accepted: images, videos, audio (max 50MB).</p>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Harvest Thanksgiving - Procession"
            />
          </div>

          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input type="number" value={draft.sort_order} onChange={(e) => setDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description…" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <MultiSelect
              label="Categories"
              options={categoryOptions}
              value={draft.category_ids}
              onValueChange={(next) => setDraft((p) => ({ ...p, category_ids: next }))}
              placeholder="Select categories…"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <MultiSelect
              label="Tags"
              options={tagOptions}
              value={draft.tag_ids}
              onValueChange={(next) => setDraft((p) => ({ ...p, tag_ids: next }))}
              placeholder="Select tags…"
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2">
            <div className="flex items-center gap-2">
              <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft((p) => ({ ...p, is_published: v }))} />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>

            <Button
              onClick={() => createItemMutation.mutate()}
              disabled={createItemMutation.isPending || !draft.title.trim() || !draft.file}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {createItemMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Items</h2>
          <Badge variant="secondary">{items.length}</Badge>
        </div>

        {itemsQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : itemsQuery.error ? (
          <Card className="p-6">
            <p className="text-sm text-destructive">Failed to load items.</p>
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No items yet. Upload the first media to this album.</p>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden">
                {/* Separate image and video handling */}
                {(it.filetype && (it.filetype.startsWith("video/") || it.filetype === "mp4")) ? (
                  <div className="relative flex h-40 w-full items-center justify-center bg-black">
                    <Play className="absolute z-10 h-12 w-12 text-white/90" />
                    <video className="h-40 w-full object-cover opacity-60" src={it.media_url} muted preload="metadata" controls />
                  </div>
                ) : (
                  <img className="h-40 w-full object-cover" src={it.media_url} alt={it.title} loading="lazy" />
                )}

                {/* {it.media_url ? (
                  <img className="h-40 w-full object-cover" src={it.media_url} alt={it.title} loading="lazy" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )} */}
                <div className="space-y-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="line-clamp-1 font-medium">{it.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{it.filetype ?? "—"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(it)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {it.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{it.description}</p> : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        title="Delete album item?"
        itemName={deleteTarget?.title}
        itemDetails={deleteTarget?.filename ?? deleteTarget?.filetype ?? undefined}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteItemMutation.mutate(deleteTarget.id);
        }}
        isLoading={deleteItemMutation.isPending}
      />
    </div>
  );
}


