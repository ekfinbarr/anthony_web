/**
 * Album Item Form Dialog
 *
 * Create or edit a single gallery album item. Media sits on the left with a
 * live preview and image editor; details sit on the right.
 *
 * @package Lovable/src/components/admin/gallery
 */

import { useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import RequiredLabel from "@/components/admin/shared/RequiredLabel";
import MediaUploadField from "@/components/admin/shared/MediaUploadField";

export type AlbumItemDraft = {
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
  /** Saved media, shown when editing until a replacement is chosen. */
  existing_url?: string | null;
  existing_is_video?: boolean;
};

export const emptyAlbumItemDraft = (sortOrder = 0): AlbumItemDraft => ({
  title: "",
  description: "",
  alt_text: "",
  credit: "",
  is_published: true,
  sort_order: sortOrder,
  category_ids: [],
  tag_ids: [],
  file: null,
});

/** Turns "Harvest_mass-2024.jpg" into "Harvest mass 2024". */
function titleFromFilename(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface AlbumItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: AlbumItemDraft;
  categoryOptions: MultiSelectOption[];
  tagOptions: MultiSelectOption[];
  isSaving: boolean;
  /** Resolve after a successful save; reject (or throw) to keep the dialog open. */
  onSubmit: (draft: AlbumItemDraft, opts: { addAnother: boolean }) => Promise<void>;
  /** Sort order to use for the next item after "Save & add another". */
  nextSortOrder?: number;
}

export default function AlbumItemFormDialog({
  open,
  onOpenChange,
  initial,
  categoryOptions,
  tagOptions,
  isSaving,
  onSubmit,
  nextSortOrder,
}: AlbumItemFormDialogProps) {
  const [draft, setDraft] = useState<AlbumItemDraft>(initial);
  const [loadedInitial, setLoadedInitial] = useState(initial);
  const [editingMedia, setEditingMedia] = useState(false);
  const isEdit = !!initial.id;

  // Load a fresh draft whenever the parent opens the dialog with a new item.
  if (loadedInitial !== initial) {
    setLoadedInitial(initial);
    setDraft(initial);
  }

  const set = <K extends keyof AlbumItemDraft>(key: K, value: AlbumItemDraft[K]) =>
    setDraft((p) => ({ ...p, [key]: value }));

  const canSubmit = !!draft.title.trim() && (isEdit || !!draft.file) && !editingMedia && !isSaving;

  const submit = async (addAnother: boolean) => {
    if (!canSubmit) return;
    try {
      await onSubmit(draft, { addAnother });
    } catch {
      return; // Caller reports the error; keep the form as-is.
    }
    if (addAnother) {
      // Keep shared metadata so a batch from one event is quick to enter.
      setDraft((p) => ({
        ...emptyAlbumItemDraft(nextSortOrder ?? p.sort_order + 1),
        credit: p.credit,
        category_ids: p.category_ids,
        tag_ids: p.tag_ids,
        is_published: p.is_published,
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSaving) onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit item" : "Add item to album"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details, or replace and re-edit the media."
              : "Choose a photo or video, crop and adjust it, then add the details."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(false);
          }}
        >
          <section className="space-y-2" aria-label="Media">
            {isEdit ? <Label>Media</Label> : <RequiredLabel>Media</RequiredLabel>}
            <MediaUploadField
              value={draft.file}
              existingUrl={draft.existing_url}
              existingIsVideo={draft.existing_is_video}
              disabled={isSaving}
              onEditingChange={setEditingMedia}
              onChange={(file) =>
                setDraft((p) => ({
                  ...p,
                  file,
                  // Suggest a title from the filename only if none has been typed yet.
                  title: file && !p.title.trim() ? titleFromFilename(file.name) : p.title,
                }))
              }
            />
          </section>

          <section className="space-y-4" aria-label="Details">
            <div className="space-y-2">
              <RequiredLabel htmlFor="album-item-title">Title</RequiredLabel>
              <Input
                id="album-item-title"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Harvest Thanksgiving - Procession"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album-item-description">Description</Label>
              <Textarea
                id="album-item-description"
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Optional description…"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album-item-alt">Alt text</Label>
              <Input
                id="album-item-alt"
                value={draft.alt_text}
                onChange={(e) => set("alt_text", e.target.value)}
                placeholder="Describe the image for accessibility"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem]">
              <div className="space-y-2">
                <Label htmlFor="album-item-credit">Credit</Label>
                <Input
                  id="album-item-credit"
                  value={draft.credit}
                  onChange={(e) => set("credit", e.target.value)}
                  placeholder="Photographer or source"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album-item-order">Position</Label>
                <Input
                  id="album-item-order"
                  type="number"
                  min={0}
                  value={draft.sort_order}
                  onChange={(e) => set("sort_order", Number(e.target.value))}
                />
              </div>
            </div>

            <MultiSelect
              label="Categories"
              options={categoryOptions}
              value={draft.category_ids}
              onValueChange={(next) => set("category_ids", next)}
              placeholder="Select categories…"
            />

            <MultiSelect
              label="Tags"
              options={tagOptions}
              value={draft.tag_ids}
              onValueChange={(next) => set("tag_ids", next)}
              placeholder="Select tags…"
            />

            <label className="flex items-center justify-between rounded-lg border p-3">
              <span>
                <span className="block text-sm font-medium">Published</span>
                <span className="block text-xs text-muted-foreground">Visible on the public gallery.</span>
              </span>
              <Switch checked={draft.is_published} onCheckedChange={(v) => set("is_published", v)} />
            </label>
          </section>

          <DialogFooter className="gap-2 border-t pt-4 md:col-span-2">
            {editingMedia ? (
              <p className="mr-auto self-center text-xs text-muted-foreground">Apply or cancel your image edits to continue.</p>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            {!isEdit ? (
              <Button type="button" variant="outline" onClick={() => void submit(true)} disabled={!canSubmit}>
                Save & add another
              </Button>
            ) : null}
            <Button type="submit" variant="church" disabled={!canSubmit} className="gap-2">
              {!isEdit ? <Upload className="h-4 w-4" /> : null}
              {isSaving ? (isEdit ? "Saving…" : "Uploading…") : isEdit ? "Save changes" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
