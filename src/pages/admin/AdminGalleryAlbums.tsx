/**
 * Admin Gallery Albums
 *
 * Provides a full CRUD workflow for Gallery Albums + Album Items:
 * - Create/edit/delete albums
 * - Upload cover image (stored via Attachments)
 * - Add/remove album items (multipart upload + metadata)
 * - Attach categories/tags to albums and items (polymorphic pivots)
 *
 * This page is designed to look and feel consistent with the rest of the Admin dashboard.
 */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { useToast } from "@/hooks/use-toast";

import categoryService from "@/services/category.service";
import tagService from "@/services/tag.service";
import attachmentService from "@/services/attachment.service";
import galleryAlbumService, { GalleryAlbum } from "@/services/galleryAlbum.service";

type AlbumDraft = {
  id?: string;
  title: string;
  description: string;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  category_ids: string[];
  tag_ids: string[];
};

type ItemDraft = {
  title: string;
  description: string;
  is_published: boolean;
  sort_order: number;
  category_ids: string[];
  tag_ids: string[];
  file: File | null;
};

const emptyAlbumDraft = (): AlbumDraft => ({
  title: "",
  description: "",
  is_featured: false,
  is_published: true,
  sort_order: 0,
  category_ids: [],
  tag_ids: [],
});

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

export default function AdminGalleryAlbums() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbum | null>(null);
  const [draft, setDraft] = useState<AlbumDraft>(emptyAlbumDraft());
  const [coverFile, setCoverFile] = useState<File | null>(null);

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

  const { data: albumsData, isLoading, error } = useQuery({
    queryKey: ["gallery-albums", "admin", { search }],
    queryFn: () => galleryAlbumService.listAdminAlbums({ search, per_page: 50 }),
  });

  const albums: GalleryAlbum[] = albumsData?.data ?? [];

  const openCreate = () => {
    setDraft(emptyAlbumDraft());
    setCoverFile(null);
    setAlbumDialogOpen(true);
  };

  const openEdit = (album: GalleryAlbum) => {
    setDraft({
      id: album.id,
      title: album.title,
      description: album.description ?? "",
      is_featured: !!album.is_featured,
      is_published: !!album.is_published,
      sort_order: album.sort_order ?? 0,
      category_ids: (album.categories ?? []).map((c) => c.id),
      tag_ids: (album.tags ?? []).map((t) => t.id),
    });
    setCoverFile(null);
    setAlbumDialogOpen(true);
  };

  const saveAlbumMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: draft.title,
        description: draft.description || null,
        is_featured: draft.is_featured,
        is_published: draft.is_published,
        sort_order: draft.sort_order,
        category_ids: draft.category_ids,
        tag_ids: draft.tag_ids,
      };

      // Create or update album metadata
      const result = draft.id
        ? await galleryAlbumService.updateAlbum(draft.id, payload)
        : await galleryAlbumService.createAlbum(payload);

      const album = result.data;

      // Optional: upload cover and link it to album via cover_attachment_id
      if (coverFile) {
        const cover = await attachmentService.create({
          file: coverFile,
          related_type: "gallery_album",
          related_id: album.id,
        });
        await galleryAlbumService.updateAlbum(album.id, { cover_attachment_id: cover.id });
      }

      return album;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
      toast({ title: "Success", description: "Album saved successfully." });
      setAlbumDialogOpen(false);
      setCoverFile(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: async (albumId: string) => await galleryAlbumService.deleteAlbum(albumId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["gallery-albums", "admin"] });
      toast({ title: "Deleted", description: "Album deleted successfully." });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-heading font-bold text-church-charcoal">Gallery Albums</h2>
          <p className="text-sm text-muted-foreground">Create and organize albums (cover + items) for the public Gallery.</p>
        </div>

        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Album
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search albums…" />
        </div>
      </div>

      {error ? (
        <Card className="p-6">
          <p className="text-sm text-destructive">Failed to load albums.</p>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">No albums yet. Create your first album.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {albums.map((a) => (
            <Card key={a.id} className="overflow-hidden">
              {a.cover_url ? (
                <img className="h-40 w-full object-cover" src={a.cover_url} alt={a.title} loading="lazy" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="line-clamp-1 font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.items_count ?? 0} items</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(a)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.is_featured ? <Badge>Featured</Badge> : null}
                  {a.is_published ? <Badge variant="secondary">Published</Badge> : <Badge variant="outline">Unpublished</Badge>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/gallery/albums/${a.id}`}>Manage items</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Album create/edit dialog */}
      <Dialog
        open={albumDialogOpen}
        onOpenChange={(open) => {
          setAlbumDialogOpen(open);
          if (!open) {
            setCoverFile(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit Album" : "Create Album"}</DialogTitle>
            <DialogDescription>Albums group media items. Add a cover image and then upload items.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Harvest Thanksgiving 2026" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Optional description…" />
            </div>

            <div className="space-y-2">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => setDraft((p) => ({ ...p, sort_order: Number(e.target.value) }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Visible on the public site.</p>
              </div>
              <Switch checked={draft.is_published} onCheckedChange={(v) => setDraft((p) => ({ ...p, is_published: v }))} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Featured</p>
                <p className="text-xs text-muted-foreground">Highlight this album on the public gallery.</p>
              </div>
              <Switch checked={draft.is_featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, is_featured: v }))} />
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

            <div className="space-y-2 md:col-span-2">
              <Label>Cover image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">
                You can skip this now and upload later. Cover is stored via the Attachments module.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 md:col-span-2">
              <Button variant="outline" onClick={() => setAlbumDialogOpen(false)} disabled={saveAlbumMutation.isPending}>
                Cancel
              </Button>
              <Button
                onClick={() => saveAlbumMutation.mutate()}
                disabled={saveAlbumMutation.isPending || !draft.title.trim()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {saveAlbumMutation.isPending ? "Saving…" : "Save"}
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
        title="Delete album?"
        itemName={deleteTarget?.title}
        itemDetails={deleteTarget?.description ?? undefined}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteAlbumMutation.mutate(deleteTarget.id);
        }}
        isLoading={deleteAlbumMutation.isPending}
      />

    </div>
  );
}


