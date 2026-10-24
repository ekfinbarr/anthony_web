/**
 * Admin Gallery Album Items Page
 *
 * Route: /admin/gallery/albums/:albumId
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowLeft, ArrowUp, Edit, Image as ImageIcon, Play, Trash2, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  id?: string;
  title: string;
  description: string;
  alt_text: string;
  credit: string;
  is_published: boolean;
  sort_order: number;
  category_ids: string[];
  tag_ids: string[];
  file: File | null;
};

const emptyItemDraft = (): ItemDraft => ({
  title: "",
  description: "",
  alt_text: "",
  credit: "",
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

function isVideoFile(filetype?: string | null) {
  return typeof filetype === "string" && filetype.startsWith("video/");
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

  const items: GalleryAlbumItem[] = useMemo(() => {
    const list = itemsQuery.data?.data ?? [];
    return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [itemsQuery.data?.data]);

  const [createDraft, setCreateDraft] = useState<ItemDraft>(emptyItemDraft());
  const [editDraft, setEditDraft] = useState<ItemDraft>(emptyItemDraft());
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbumItem | null>(null);

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "items", "admin"] });
    await qc.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
    await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "admin-show"] });
  };

  const createItemMutation = useMutation({
    mutationFn: async () => {
      if (!safeAlbumId) throw new Error("Missing album id");
      if (!createDraft.file) throw new Error("Please select a file");
      if (!createDraft.title.trim()) throw new Error("Title is required");

      return await galleryAlbumService.createAlbumItem(safeAlbumId, {
        title: createDraft.title.trim(),
        description: createDraft.description.trim() ? createDraft.description.trim() : null,
        alt_text: createDraft.alt_text.trim() || null,
        credit: createDraft.credit.trim() || null,
        file: createDraft.file,
        is_published: createDraft.is_published,
        sort_order: createDraft.sort_order,
        category_ids: createDraft.category_ids,
        tag_ids: createDraft.tag_ids,
      });
    },
    onSuccess: async () => {
      toast({ title: "Success", description: "Album item uploaded." });
      setCreateDraft(emptyItemDraft());
      await invalidate();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateItemMutation = useMutation({
    mutationFn: async () => {
      if (!safeAlbumId || !editDraft.id) throw new Error("Missing item");
      return await galleryAlbumService.updateAlbumItem(safeAlbumId, editDraft.id, {
        title: editDraft.title.trim(),
        description: editDraft.description.trim() ? editDraft.description.trim() : null,
        alt_text: editDraft.alt_text.trim() || null,
        credit: editDraft.credit.trim() || null,
        file: editDraft.file ?? undefined,
        is_published: editDraft.is_published,
        sort_order: editDraft.sort_order,
        category_ids: editDraft.category_ids,
        tag_ids: editDraft.tag_ids,
      });
    },
    onSuccess: async () => {
      toast({ title: "Saved", description: "Item updated." });
      setEditOpen(false);
      setEditDraft(emptyItemDraft());
      await invalidate();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderMutation = useMutation({
    mutationFn: async (orders: { id: string; sort_order: number }[]) => {
      if (!safeAlbumId) throw new Error("Missing album id");
      return await galleryAlbumService.reorderAdminItems(safeAlbumId, orders);
    },
    onSuccess: async () => {
      await invalidate();
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
      await invalidate();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (item: GalleryAlbumItem) => {
    setEditDraft({
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      alt_text: item.alt_text ?? "",
      credit: item.credit ?? "",
      is_published: !!item.is_published,
      sort_order: item.sort_order ?? 0,
      category_ids: (item.categories ?? []).map((c) => c.id),
      tag_ids: (item.tags ?? []).map((t) => t.id),
      file: null,
    });
    setEditOpen(true);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(next, 0, moved);
    const orders = reordered.map((item, i) => ({ id: item.id, sort_order: i }));
    reorderMutation.mutate(orders);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to="/admin/gallery"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery Albums
          </Link>
          <h1 className="text-2xl font-heading font-bold text-church-charcoal">
            {albumQuery.isLoading ? "Loading album…" : album?.title ?? "Album"}
          </h1>
          {album?.description ? <p className="text-sm text-muted-foreground">{album.description}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{items.length} items</Badge>
            {typeof album?.photo_count === "number" ? (
              <Badge variant="outline">{album.photo_count} photos</Badge>
            ) : null}
            {typeof album?.video_count === "number" ? (
              <Badge variant="outline">{album.video_count} videos</Badge>
            ) : null}
            {album?.is_featured ? <Badge>Featured</Badge> : null}
            {album?.is_published ? (
              <Badge variant="secondary">Published</Badge>
            ) : (
              <Badge variant="outline">Unpublished</Badge>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a new item</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>File</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={(e) => setCreateDraft((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-muted-foreground">Images and videos only (max 50MB).</p>
          </div>

          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={createDraft.title}
              onChange={(e) => setCreateDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Harvest Thanksgiving - Procession"
            />
          </div>

          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={createDraft.sort_order}
              onChange={(e) => setCreateDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={createDraft.description}
              onChange={(e) => setCreateDraft((p) => ({ ...p, description: e.target.value }))}
              placeholder="Optional description…"
            />
          </div>

          <div className="space-y-2">
            <Label>Alt text</Label>
            <Input
              value={createDraft.alt_text}
              onChange={(e) => setCreateDraft((p) => ({ ...p, alt_text: e.target.value }))}
              placeholder="Describe the image for accessibility"
            />
          </div>

          <div className="space-y-2">
            <Label>Credit</Label>
            <Input
              value={createDraft.credit}
              onChange={(e) => setCreateDraft((p) => ({ ...p, credit: e.target.value }))}
              placeholder="Photographer or source"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <MultiSelect
              label="Categories"
              options={categoryOptions}
              value={createDraft.category_ids}
              onValueChange={(next) => setCreateDraft((p) => ({ ...p, category_ids: next }))}
              placeholder="Select categories…"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <MultiSelect
              label="Tags"
              options={tagOptions}
              value={createDraft.tag_ids}
              onValueChange={(next) => setCreateDraft((p) => ({ ...p, tag_ids: next }))}
              placeholder="Select tags…"
            />
          </div>

          <div className="flex items-center justify-between md:col-span-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={createDraft.is_published}
                onCheckedChange={(v) => setCreateDraft((p) => ({ ...p, is_published: v }))}
              />
              <span className="text-sm text-muted-foreground">Published</span>
            </div>

            <Button
              onClick={() => createItemMutation.mutate()}
              disabled={createItemMutation.isPending || !createDraft.title.trim() || !createDraft.file}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              {createItemMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((it, index) => (
              <Card key={it.id} className="overflow-hidden">
                {it.media_url ? (
                  isVideoFile(it.filetype) ? (
                    <div className="relative flex h-40 w-full items-center justify-center bg-black">
                      <Play className="absolute z-10 h-10 w-10 text-white/90" aria-hidden="true" />
                      <video
                        className="h-40 w-full object-cover opacity-60"
                        src={it.media_url}
                        muted
                        preload="metadata"
                      />
                    </div>
                  ) : (
                    <img className="h-40 w-full object-cover" src={it.media_url} alt={it.title} loading="lazy" />
                  )
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-medium">{it.title}</p>
                      <p className="text-xs text-muted-foreground">Order {it.sort_order}</p>
                    </div>
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === 0 || reorderMutation.isPending}
                        onClick={() => moveItem(index, -1)}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={index === items.length - 1 || reorderMutation.isPending}
                        onClick={() => moveItem(index, 1)}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(it)} aria-label="Edit">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(it)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {!it.is_published ? <Badge variant="outline">Unpublished</Badge> : null}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditDraft(emptyItemDraft());
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
            <DialogDescription>Update caption, accessibility text, credit, and publication.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editDraft.title}
                onChange={(e) => setEditDraft((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editDraft.description}
                onChange={(e) => setEditDraft((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Alt text</Label>
              <Input
                value={editDraft.alt_text}
                onChange={(e) => setEditDraft((p) => ({ ...p, alt_text: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit</Label>
              <Input
                value={editDraft.credit}
                onChange={(e) => setEditDraft((p) => ({ ...p, credit: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Replace file (optional)</Label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={(e) => setEditDraft((p) => ({ ...p, file: e.target.files?.[0] ?? null }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editDraft.is_published}
                  onCheckedChange={(v) => setEditDraft((p) => ({ ...p, is_published: v }))}
                />
                <span className="text-sm">Published</span>
              </div>
              <Button
                onClick={() => updateItemMutation.mutate()}
                disabled={updateItemMutation.isPending || !editDraft.title.trim()}
              >
                {updateItemMutation.isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
