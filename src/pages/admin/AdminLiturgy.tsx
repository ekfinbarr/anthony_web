/**
 * Admin — Order of Mass & Rites
 *
 * Lists liturgy resources (Order of Mass, Baptism, Wake Keep, …) with the
 * languages each one has been written in. Texts are edited on the editor page.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { liturgyIcon } from "@/components/liturgy/liturgyIcons";
import { notify } from "@/lib/notify";
import liturgyService, { type AdminLiturgyResource, type LiturgyCategory } from "@/services/liturgy.service";

const AdminLiturgy = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<LiturgyCategory>("mass");
  const [deleting, setDeleting] = useState<AdminLiturgyResource | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "liturgy-resources"],
    queryFn: liturgyService.adminList,
  });

  const resources = data?.data ?? [];
  const languages = new Map((data?.meta.languages ?? []).map((l) => [l.code, l.name]));
  const categories = data?.meta.categories;

  const createMutation = useMutation({
    mutationFn: () => liturgyService.create({ title: newTitle.trim(), category: newCategory, sort_order: resources.length + 1 }),
    onSuccess: (resource) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "liturgy-resources"] });
      setCreating(false);
      setNewTitle("");
      navigate(`/admin/liturgy/${resource.id}`);
    },
    onError: (error) => notify.error(error),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => liturgyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "liturgy-resources"] });
      queryClient.invalidateQueries({ queryKey: ["liturgy-resources"] });
      notify.success("Deleted");
      setDeleting(null);
    },
    onError: (error) => notify.error(error),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Order of Mass &amp; Rites</h1>
          <p className="mt-1 text-muted-foreground">
            Texts shown on the public <Link to="/order-of-mass" className="underline">Order of Mass</Link> page, in each language.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New celebration
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <GenericEmptyState
          title="No celebrations yet"
          description="Add the Order of Mass, Baptism, Wake Keep or any other rite."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((r) => {
            const Icon = liturgyIcon(r.icon);
            return (
              <Card key={r.id} className="flex flex-col transition-shadow hover:shadow-md">
                <CardContent className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start gap-3">
                    <Icon size="sm" />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-heading text-lg font-semibold leading-tight">{r.title}</h2>
                      <p className="text-xs text-muted-foreground">{categories?.[r.category] ?? r.category}</p>
                    </div>
                    <Badge variant={r.is_published ? "default" : "secondary"}>{r.is_published ? "Published" : "Draft"}</Badge>
                  </div>
                  {r.summary && <p className="line-clamp-2 text-sm text-muted-foreground">{r.summary}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {r.texts.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No text yet</span>
                    ) : (
                      r.texts.map((t) => (
                        <Badge key={t.language} variant="outline" className={t.is_published ? "" : "border-dashed opacity-70"}>
                          {languages.get(t.language) ?? t.language}
                          {!t.is_published && " (draft)"}
                        </Badge>
                      ))
                    )}
                  </div>
                  <div className="mt-auto flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link to={`/admin/liturgy/${r.id}`}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </Link>
                    </Button>
                    {r.is_published && (
                      <Button asChild size="sm" variant="outline" aria-label="View on site">
                        <a href={`/order-of-mass?rite=${r.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setDeleting(r)} aria-label={`Delete ${r.title}`}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New celebration</DialogTitle>
            <DialogDescription>You'll add the text for each language on the next screen.</DialogDescription>
          </DialogHeader>
          <form
            id="create-liturgy"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (newTitle.trim()) createMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="liturgy-title">Title</Label>
              <Input
                id="liturgy-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Funeral Mass"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newCategory} onValueChange={(v) => setNewCategory(v as LiturgyCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories ?? {}).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-liturgy" disabled={!newTitle.trim() || createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete celebration"
        description="This deletes the celebration and its text in every language."
        itemName={deleting?.title}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminLiturgy;
