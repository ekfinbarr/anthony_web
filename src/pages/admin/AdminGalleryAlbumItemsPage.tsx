/**
 * Admin Gallery Album Items Page
 *
 * Route: /admin/gallery/albums/:albumId
 */

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Edit, Image as ImageIcon, Play, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MultiSelectOption } from "@/components/ui/multi-select";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import AlbumItemFormDialog, { AlbumItemDraft, emptyAlbumItemDraft } from "@/components/admin/gallery/AlbumItemFormDialog";
import { useToast } from "@/hooks/use-toast";

import categoryService from "@/services/category.service";
import tagService from "@/services/tag.service";
import galleryAlbumService, { GalleryAlbum, GalleryAlbumItem } from "@/services/galleryAlbum.service";

type ItemFilter = "all" | "photos" | "videos" | "unpublished";

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

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<AlbumItemDraft>(emptyAlbumItemDraft());
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbumItem | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ItemFilter>("all");

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "items", "admin"] });
    await qc.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
    await qc.invalidateQueries({ queryKey: ["gallery-albums", safeAlbumId, "admin-show"] });
  };

  const saveItemMutation = useMutation({
    mutationFn: async (draft: AlbumItemDraft) => {
      if (!safeAlbumId) throw new Error("Missing album id");
      if (!draft.title.trim()) throw new Error("Title is required");
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() ? draft.description.trim() : null,
        alt_text: draft.alt_text.trim() || null,
        credit: draft.credit.trim() || null,
        is_published: draft.is_published,
        sort_order: draft.sort_order,
        category_ids: draft.category_ids,
        tag_ids: draft.tag_ids,
      };
      if (draft.id) {
        return await galleryAlbumService.updateAlbumItem(safeAlbumId, draft.id, {
          ...payload,
          file: draft.file ?? undefined,
        });
      }
      if (!draft.file) throw new Error("Please select a file");
      return await galleryAlbumService.createAlbumItem(safeAlbumId, { ...payload, file: draft.file });
    },
    onSuccess: async (_res, draft) => {
      toast(
        draft.id
          ? { title: "Saved", description: "Item updated." }
          : { title: "Success", description: "Album item uploaded." }
      );
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

  const nextSortOrder = items.length ? Math.max(...items.map((i) => i.sort_order ?? 0)) + 1 : 0;

  const openCreate = () => {
    setFormInitial(emptyAlbumItemDraft(nextSortOrder));
    setFormOpen(true);
  };

  const openEdit = (item: GalleryAlbumItem) => {
    setFormInitial({
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
      existing_url: item.media_url ?? null,
      existing_is_video: isVideoFile(item.filetype),
    });
    setFormOpen(true);
  };

  const submitItem = async (draft: AlbumItemDraft, { addAnother }: { addAnother: boolean }) => {
    await saveItemMutation.mutateAsync(draft);
    if (!addAnother) setFormOpen(false);
  };

  const counts = useMemo(
    () => ({
      all: items.length,
      photos: items.filter((i) => !isVideoFile(i.filetype)).length,
      videos: items.filter((i) => isVideoFile(i.filetype)).length,
      unpublished: items.filter((i) => !i.is_published).length,
    }),
    [items]
  );

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "photos" && isVideoFile(i.filetype)) return false;
      if (filter === "videos" && !isVideoFile(i.filetype)) return false;
      if (filter === "unpublished" && i.is_published) return false;
      if (q && !`${i.title} ${i.description ?? ""} ${i.credit ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, search]);

  // Reordering only makes sense against the full, unfiltered list.
  const canReorder = filter === "all" && !search.trim();

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
      <div className="space-y-3">
        <Link
          to="/admin/gallery"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Gallery Albums
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h1 className="text-2xl font-heading font-bold text-church-charcoal">
              {albumQuery.isLoading ? "Loading album…" : album?.title ?? "Album"}
            </h1>
            {album?.description ? <p className="max-w-2xl text-sm text-muted-foreground">{album.description}</p> : null}
            <div className="flex flex-wrap gap-2">
              {album?.is_published ? (
                <Badge variant="secondary">Published</Badge>
              ) : (
                <Badge variant="outline">Unpublished</Badge>
              )}
              {album?.is_featured ? <Badge>Featured</Badge> : null}
            </div>
          </div>

          <Button variant="church" onClick={openCreate} disabled={!safeAlbumId} className="gap-2">
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(v) => v && setFilter(v as ItemFilter)}
            className="flex-wrap justify-start"
            aria-label="Filter items"
          >
            {(
              [
                ["all", "All"],
                ["photos", "Photos"],
                ["videos", "Videos"],
                ["unpublished", "Unpublished"],
              ] as const
            ).map(([value, label]) => (
              <ToggleGroupItem key={value} value={value} size="sm" className="gap-1.5">
                {label}
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                  {counts[value]}
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items…"
              className="pl-9"
              aria-label="Search items"
            />
          </div>
        </div>

        <CardContent className="p-4">
          {itemsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : itemsQuery.error ? (
            <p className="py-10 text-center text-sm text-destructive">Failed to load items.</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <div className="rounded-full bg-muted p-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No items in this album yet</p>
                <p className="text-sm text-muted-foreground">Upload the first photo or video to get started.</p>
              </div>
              <Button variant="church" onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No items match your filters.</p>
          ) : (
            <>
              {!canReorder ? (
                <p className="mb-3 text-xs text-muted-foreground">Clear the search and filters to reorder items.</p>
              ) : null}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {visibleItems.map((it) => {
                  const index = items.indexOf(it);
                  const video = isVideoFile(it.filetype);
                  return (
                    <div key={it.id} className="group overflow-hidden rounded-lg border bg-card">
                      <button
                        type="button"
                        onClick={() => openEdit(it)}
                        className="relative block aspect-[4/3] w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={`Edit ${it.title}`}
                      >
                        {it.media_url ? (
                          video ? (
                            <>
                              <video
                                className="h-full w-full object-cover"
                                src={it.media_url}
                                muted
                                preload="metadata"
                              />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-10 w-10 text-white/90" aria-hidden="true" />
                              </span>
                            </>
                          ) : (
                            <img
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              src={it.media_url}
                              alt={it.alt_text || it.title}
                              loading="lazy"
                            />
                          )
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </span>
                        )}
                        <span className="absolute left-2 top-2 flex gap-1">
                          {video ? <Badge className="bg-black/60 text-white hover:bg-black/60">Video</Badge> : null}
                          {!it.is_published ? (
                            <Badge variant="outline" className="border-transparent bg-white/90">
                              Unpublished
                            </Badge>
                          ) : null}
                        </span>
                      </button>

                      <div className="flex items-center justify-between gap-1 p-2 pl-3">
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium" title={it.title}>
                            {it.title}
                          </p>
                          <p className="text-xs text-muted-foreground">#{index + 1}</p>
                        </div>
                        <div className="flex shrink-0">
                          {canReorder ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === 0 || reorderMutation.isPending}
                                onClick={() => moveItem(index, -1)}
                                aria-label="Move earlier"
                              >
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                disabled={index === items.length - 1 || reorderMutation.isPending}
                                onClick={() => moveItem(index, 1)}
                                aria-label="Move later"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(it)}
                            aria-label="Edit"
                          >
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
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlbumItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={formInitial}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        isSaving={saveItemMutation.isPending}
        onSubmit={submitItem}
        nextSortOrder={nextSortOrder}
      />

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
