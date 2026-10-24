/**
 * Admin Sunday Bulletins
 *
 * Weekly bulletin publishing for the public /bulletin archive.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import bulletinService, {
  type Bulletin,
  type BulletinAdminPayload,
  formatLabel,
} from "@/services/bulletin.service";

const emptyForm = {
  title: "",
  bulletin_date: "",
  description: "",
  is_published: true,
  is_featured: false,
};

const AdminBulletins = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Bulletin | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [bulletinFile, setBulletinFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Bulletin | null>(null);

  const listParams = useMemo(
    () => ({
      page,
      per_page: 15,
      search: debouncedSearch || undefined,
      sort: "newest" as const,
      is_published:
        statusFilter === "all" ? undefined : statusFilter === "published" ? true : false,
    }),
    [page, debouncedSearch, statusFilter],
  );

  const listQuery = useQuery({
    queryKey: ["admin-bulletins", listParams],
    queryFn: () => bulletinService.adminList(listParams),
    placeholderData: (prev) => prev,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-bulletins-stats"],
    queryFn: () => bulletinService.adminStats(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-bulletins"] });
    queryClient.invalidateQueries({ queryKey: ["admin-bulletins-stats"] });
    queryClient.invalidateQueries({ queryKey: ["bulletins-latest"] });
    queryClient.invalidateQueries({ queryKey: ["bulletins-list"] });
    queryClient.invalidateQueries({ queryKey: ["bulletins-meta"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: BulletinAdminPayload) => {
      if (editing) return bulletinService.update(editing.slug, payload);
      return bulletinService.create(payload);
    },
    onSuccess: (bulletin) => {
      invalidate();
      setEditorOpen(false);
      setEditing(null);
      toast({
        title: bulletin.is_published ? "Published" : "Saved as draft",
        description: bulletin.is_published
          ? "The bulletin is live on the public archive."
          : "Bulletin saved as a draft.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Could not save",
        description: err.message || "Please check the form and try again.",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: Bulletin) =>
      item.is_published
        ? bulletinService.unpublish(item.slug)
        : bulletinService.publish(item.slug),
    onSuccess: (bulletin) => {
      invalidate();
      toast({
        title: bulletin.is_published ? "Published" : "Unpublished",
        description: bulletin.is_published
          ? "Now visible on the public site."
          : "Removed from the public archive.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Could not update status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => bulletinService.remove(slug),
    onSuccess: () => {
      invalidate();
      setDeleteOpen(false);
      setToDelete(null);
      toast({ title: "Deleted", description: "Bulletin removed." });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete bulletin.",
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    const today = new Date();
    const day = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + ((7 - day) % 7));
    setEditing(null);
    setForm({
      ...emptyForm,
      bulletin_date: sunday.toISOString().slice(0, 10),
      is_published: true,
    });
    setBulletinFile(null);
    setImageFiles(null);
    setThumbnailFile(null);
    setFileError(null);
    setEditorOpen(true);
  };

  const openEdit = (item: Bulletin) => {
    setEditing(item);
    setForm({
      title: item.title,
      bulletin_date: item.bulletin_date?.slice(0, 10) ?? "",
      description: item.description ?? "",
      is_published: Boolean(item.is_published),
      is_featured: Boolean(item.is_featured),
    });
    setBulletinFile(null);
    setImageFiles(null);
    setThumbnailFile(null);
    setFileError(null);
    setEditorOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!form.bulletin_date) {
      toast({ title: "Sunday date required", variant: "destructive" });
      return;
    }

    const hasExisting = Boolean(editing?.file_url || (editing?.image_urls?.length ?? 0) > 0);
    const hasNew = Boolean(bulletinFile) || Boolean(imageFiles && imageFiles.length > 0);
    if (!editing && !hasNew) {
      setFileError("Upload a PDF, Word document, or one or more images.");
      return;
    }
    if (editing && !hasExisting && !hasNew) {
      setFileError("Upload a PDF, Word document, or one or more images.");
      return;
    }
    setFileError(null);

    const images = imageFiles ? Array.from(imageFiles) : undefined;
    saveMutation.mutate({
      title: form.title.trim(),
      bulletin_date: form.bulletin_date,
      description: form.description.trim() || null,
      is_published: form.is_published,
      is_featured: form.is_featured,
      bulletin_file: bulletinFile,
      images,
      thumbnail: thumbnailFile,
      replace_images: Boolean(images?.length),
    });
  };

  const items = listQuery.data?.data ?? [];
  const lastPage = listQuery.data?.last_page ?? 1;
  const total = listQuery.data?.total ?? 0;
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-church-charcoal">Sunday Bulletins</h1>
          <p className="text-sm text-muted-foreground">
            Upload and publish weekly parish bulletins for the public archive.
          </p>
        </div>
        <Button variant="church" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New bulletin
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: stats?.total_bulletins },
          { label: "Published", value: stats?.published_bulletins },
          { label: "Drafts", value: stats?.draft_bulletins },
          { label: "Downloads", value: stats?.total_downloads },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <CardTitle className="text-2xl">
                {statsQuery.isLoading ? <Skeleton className="h-8 w-12" /> : (card.value ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by title…"
                value={searchInput}
                onChange={(e) => {
                  setPage(1);
                  setSearchInput(e.target.value);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v: "all" | "published" | "draft") => {
                setPage(1);
                setStatusFilter(v);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            {total} edition{total === 1 ? "" : "s"}
          </p>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {listQuery.isError && (
            <div className="py-12 text-center">
              <p className="text-destructive">Failed to load bulletins.</p>
              <Button className="mt-3" variant="outline" onClick={() => listQuery.refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!listQuery.isLoading && !listQuery.isError && items.length === 0 && (
            <GenericEmptyState
              icon="file"
              title="No bulletins yet"
              description="Publish this Sunday’s edition to start the archive."
              actionLabel="New bulletin"
              onAction={openCreate}
            />
          )}

          {!listQuery.isLoading && items.length > 0 && (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="hidden h-16 w-12 shrink-0 overflow-hidden rounded border bg-muted sm:block">
                      {item.cover_url ? (
                        <img src={item.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-church-charcoal">{item.title}</h3>
                        <Badge variant={item.is_published ? "default" : "secondary"}>
                          {item.is_published ? "Published" : "Draft"}
                        </Badge>
                        {item.file_format && (
                          <Badge variant="outline">{formatLabel(item.file_format)}</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.bulletin_date_formatted ||
                          (item.bulletin_date
                            ? format(parseISO(item.bulletin_date), "d MMMM yyyy")
                            : "")}
                        {item.file_size_formatted ? ` · ${item.file_size_formatted}` : ""}
                        {typeof item.download_count === "number"
                          ? ` · ${item.download_count} downloads`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                      <Edit className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="More actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleMutation.mutate(item)}>
                          {item.is_published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        {item.file_url && (
                          <DropdownMenuItem asChild>
                            <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              View file
                            </a>
                          </DropdownMenuItem>
                        )}
                        {item.is_published && (
                          <DropdownMenuItem asChild>
                            <a href={`/bulletin/${item.slug}`} target="_blank" rel="noopener noreferrer">
                              Open public page
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setToDelete(item);
                            setDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {lastPage > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {lastPage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= lastPage}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sunday Bulletin" : "Publish Sunday Bulletin"}</DialogTitle>
            <DialogDescription>
              Required fields are marked with an asterisk (*). Use the Sunday this edition belongs
              to, not the upload date.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="bulletin-title">
                Bulletin title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bulletin-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Sunday Bulletin — 25 October 2026"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-date">
                Sunday publication date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bulletin-date"
                type="date"
                value={form.bulletin_date}
                onChange={(e) => setForm((f) => ({ ...f, bulletin_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-description">Description</Label>
              <Textarea
                id="bulletin-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional short summary for the archive listing."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-file">
                Bulletin file {!editing && <span className="text-destructive">*</span>}
              </Label>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX, or a single image (max 25 MB).
              </p>
              {editing?.file_url && !bulletinFile && (
                <p className="text-xs text-muted-foreground">
                  Current file:{" "}
                  <a
                    href={editing.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View existing
                  </a>
                </p>
              )}
              <Input
                id="bulletin-file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                onChange={(e) => {
                  setBulletinFile(e.target.files?.[0] ?? null);
                  setFileError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-images">Additional images (optional)</Label>
              <p className="text-xs text-muted-foreground">
                For multi-page photo bulletins. Replacing images clears previous ones.
              </p>
              <Input
                id="bulletin-images"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  setImageFiles(e.target.files);
                  setFileError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulletin-thumb">Cover thumbnail (optional)</Label>
              <Input
                id="bulletin-thumb"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {fileError && <p className="text-sm font-medium text-destructive">{fileError}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="bulletin-published">
                    Published <span className="text-destructive">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Visible on the public archive.</p>
                </div>
                <Switch
                  id="bulletin-published"
                  checked={form.is_published}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="bulletin-featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Highlight when needed.</p>
                </div>
                <Switch
                  id="bulletin-featured"
                  checked={form.is_featured}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="church" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editing ? "Update bulletin" : "Save bulletin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete bulletin?"
        description={
          toDelete
            ? `Delete “${toDelete.title}”? This cannot be undone.`
            : "This cannot be undone."
        }
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.slug)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminBulletins;
