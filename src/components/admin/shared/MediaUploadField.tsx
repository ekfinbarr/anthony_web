/**
 * Media Upload Field
 *
 * Drag-and-drop picker for images and videos with a live preview and an
 * in-place image editor (crop, aspect ratio, zoom, rotate, flip, and light
 * adjustments). The edited image is rendered to a new File before it is
 * handed back through onChange, so callers upload exactly what was previewed.
 *
 * @package Lovable/src/components/admin/shared
 */

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Image as ImageIcon,
  RotateCcw,
  RotateCw,
  Undo2,
  Upload,
  Video,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime";
const DEFAULT_MAX_BYTES = 50 * 1024 * 1024;
// GIFs lose their animation when drawn to a canvas, so they are preview-only.
const EDITABLE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ASPECTS = [
  { value: "original", label: "Original", ratio: undefined },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
] as const;

type AspectValue = (typeof ASPECTS)[number]["value"];

type Adjustments = { brightness: number; contrast: number; saturation: number };

const NEUTRAL_ADJUSTMENTS: Adjustments = { brightness: 100, contrast: 100, saturation: 100 };

const supportsCanvasFilter =
  typeof window !== "undefined" &&
  typeof CanvasRenderingContext2D !== "undefined" &&
  "filter" in CanvasRenderingContext2D.prototype;

function filterCss({ brightness, contrast, saturation }: Adjustments) {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be opened."));
    image.src = src;
  });
}

function rotatedSize(width: number, height: number, degrees: number) {
  const rad = (degrees * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

type EditOptions = {
  pixels: Area;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  adjustments: Adjustments;
};

async function renderEdit(src: string, original: File, opts: EditOptions): Promise<File> {
  const image = await loadImage(src);
  const bounds = rotatedSize(image.naturalWidth, image.naturalHeight, opts.rotation);

  // Draw the whole rotated/flipped image, then copy the crop region out of it.
  const stage = document.createElement("canvas");
  stage.width = Math.round(bounds.width);
  stage.height = Math.round(bounds.height);
  const stageCtx = stage.getContext("2d");
  if (!stageCtx) throw new Error("The image could not be edited.");
  if (supportsCanvasFilter) stageCtx.filter = filterCss(opts.adjustments);
  stageCtx.translate(stage.width / 2, stage.height / 2);
  stageCtx.rotate((opts.rotation * Math.PI) / 180);
  stageCtx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
  stageCtx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(opts.pixels.width));
  out.height = Math.max(1, Math.round(opts.pixels.height));
  const outCtx = out.getContext("2d");
  if (!outCtx) throw new Error("The image could not be edited.");
  outCtx.drawImage(stage, opts.pixels.x, opts.pixels.y, opts.pixels.width, opts.pixels.height, 0, 0, out.width, out.height);

  const type = original.type === "image/png" || original.type === "image/webp" ? original.type : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    out.toBlob((next) => (next ? resolve(next) : reject(new Error("The image could not be edited."))), type, 0.92);
  });
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const base = original.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${extension}`, { type, lastModified: Date.now() });
}

function useObjectUrl(file: File | null) {
  const [entry, setEntry] = useState<{ file: File; url: string } | null>(null);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Subscribing to a browser resource: the URL must be created and revoked together.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntry({ file, url });
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return file && entry?.file === file ? entry.url : null;
}

export interface MediaUploadFieldProps {
  value: File | null;
  onChange: (file: File | null) => void;
  /** Media already saved on the server, shown until a new file is picked. */
  existingUrl?: string | null;
  existingIsVideo?: boolean;
  accept?: string;
  maxBytes?: number;
  disabled?: boolean;
  /** Reports whether the editor is open so the parent can block submitting mid-edit. */
  onEditingChange?: (editing: boolean) => void;
}

export default function MediaUploadField({
  value,
  onChange,
  existingUrl,
  existingIsVideo,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  disabled,
  onEditingChange,
}: MediaUploadFieldProps) {
  const inputId = useId();
  const messageId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);

  // The file as first picked, so edits can always be reverted.
  const [pickedOriginal, setOriginal] = useState<File | null>(null);
  const [loadedSize, setLoadedSize] = useState<{ url: string; width: number; height: number } | null>(null);

  const [editorOpen, setEditing] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspect, setAspect] = useState<AspectValue>("original");
  const [adjustments, setAdjustments] = useState<Adjustments>(NEUTRAL_ADJUSTMENTS);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number } | null>(null);
  const [applying, setApplying] = useState(false);

  // When the parent clears the field (e.g. after a successful upload), drop the edit session too.
  const original = value ? pickedOriginal : null;
  const editing = editorOpen && !!value;

  const previewUrl = useObjectUrl(value);
  const originalUrl = useObjectUrl(original);

  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  const acceptedTypes = useMemo(() => new Set(accept.split(",").map((t) => t.trim())), [accept]);
  const isEditable = !!value && EDITABLE_TYPES.has(value.type);
  const isEdited = !!value && !!original && value !== original;

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setAspect("original");
    setAdjustments(NEUTRAL_ADJUSTMENTS);
    setPixels(null);
  };

  const pick = (file: File) => {
    if (file.size <= 0) return setMessage("Choose a file that is not empty.");
    if (file.size > maxBytes) return setMessage(`The file must be ${formatFileSize(maxBytes)} or smaller.`);
    if (!acceptedTypes.has(file.type)) return setMessage("This file type is not supported.");
    setMessage("");
    setOriginal(file);
    setEditing(false);
    resetEditor();
    onChange(file);
  };

  const clear = () => {
    setMessage("");
    onChange(null);
  };

  const startEditing = () => {
    // Edits always start from the original so quality doesn't degrade across passes.
    resetEditor();
    setEditing(true);
  };

  const applyEdit = async () => {
    if (!original || !originalUrl || !pixels) return;
    setApplying(true);
    try {
      const edited = await renderEdit(originalUrl, original, { pixels, rotation, flipH, flipV, adjustments });
      if (edited.size > maxBytes) {
        setMessage(`The edited image must be ${formatFileSize(maxBytes)} or smaller.`);
        return;
      }
      setMessage("");
      onChange(edited);
      setEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be edited.");
    } finally {
      setApplying(false);
    }
  };

  const revert = () => {
    if (original) onChange(original);
  };

  const openPicker = () => inputRef.current?.click();

  const hiddenInput = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={accept}
      className="sr-only"
      disabled={disabled}
      aria-describedby={message ? messageId : undefined}
      onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file) pick(file);
      }}
    />
  );

  const errorMessage = message ? (
    <p id={messageId} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  ) : null;

  if (editing && originalUrl) {
    // "Original" keeps the image's own shape, following quarter-turn rotations.
    const quarterTurned = Math.round(rotation / 90) % 2 === 1;
    const ratio =
      ASPECTS.find((a) => a.value === aspect)?.ratio ??
      (mediaSize ? (quarterTurned ? mediaSize.height / mediaSize.width : mediaSize.width / mediaSize.height) : undefined);
    return (
      <div className="space-y-4">
        <div className="relative h-72 overflow-hidden rounded-lg bg-neutral-900 sm:h-80">
          <Cropper
            image={originalUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={ratio}
            objectFit="contain"
            onMediaLoaded={(m) => setMediaSize({ width: m.naturalWidth, height: m.naturalHeight })}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_area, next) => setPixels(next)}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom}) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`}
            style={{ mediaStyle: { filter: filterCss(adjustments) } }}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Aspect ratio</Label>
          <ToggleGroup
            type="single"
            value={aspect}
            onValueChange={(v) => v && setAspect(v as AspectValue)}
            className="flex-wrap justify-start"
          >
            {ASPECTS.map((a) => (
              <ToggleGroupItem key={a.value} value={a.value} size="sm" variant="outline">
                {a.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Rotate left
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
            <RotateCw className="mr-1.5 h-4 w-4" /> Rotate right
          </Button>
          <Button type="button" variant={flipH ? "secondary" : "outline"} size="sm" onClick={() => setFlipH((f) => !f)}>
            <FlipHorizontal2 className="mr-1.5 h-4 w-4" /> Flip
          </Button>
          <Button type="button" variant={flipV ? "secondary" : "outline"} size="sm" onClick={() => setFlipV((f) => !f)}>
            <FlipVertical2 className="mr-1.5 h-4 w-4" /> Flip vertical
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={resetEditor}>
            <Undo2 className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <EditorSlider label="Zoom" value={zoom} min={1} max={4} step={0.05} display={`${zoom.toFixed(1)}×`} onChange={setZoom} />
          <EditorSlider
            label="Straighten"
            value={rotation}
            min={0}
            max={359}
            step={1}
            display={`${Math.round(rotation)}°`}
            onChange={setRotation}
          />
          {supportsCanvasFilter ? (
            <>
              <EditorSlider
                label="Brightness"
                value={adjustments.brightness}
                min={50}
                max={150}
                step={1}
                display={`${adjustments.brightness}%`}
                onChange={(v) => setAdjustments((a) => ({ ...a, brightness: v }))}
              />
              <EditorSlider
                label="Contrast"
                value={adjustments.contrast}
                min={50}
                max={150}
                step={1}
                display={`${adjustments.contrast}%`}
                onChange={(v) => setAdjustments((a) => ({ ...a, contrast: v }))}
              />
              <EditorSlider
                label="Saturation"
                value={adjustments.saturation}
                min={0}
                max={200}
                step={1}
                display={`${adjustments.saturation}%`}
                onChange={(v) => setAdjustments((a) => ({ ...a, saturation: v }))}
              />
            </>
          ) : null}
        </div>

        {errorMessage}

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={() => setEditing(false)} disabled={applying}>
            Cancel
          </Button>
          <Button type="button" variant="church" onClick={applyEdit} disabled={applying || !pixels}>
            {applying ? "Applying…" : "Apply changes"}
          </Button>
        </div>
      </div>
    );
  }

  const shownUrl = previewUrl ?? existingUrl ?? null;
  const shownIsVideo = value ? isVideo(value) : !!existingIsVideo;
  const dimensions = loadedSize && loadedSize.url === shownUrl ? loadedSize : null;

  if (shownUrl) {
    return (
      <div className="space-y-3">
        <div
          className={cn(
            "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-neutral-100",
            dragging && "ring-2 ring-primary"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file && !disabled) pick(file);
          }}
        >
          {shownIsVideo ? (
            <video src={shownUrl} controls className="h-full w-full bg-black object-contain" />
          ) : (
            <img
              src={shownUrl}
              alt="Selected media preview"
              className="h-full w-full object-contain"
              onLoad={(e) =>
                setLoadedSize({ url: shownUrl, width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })
              }
            />
          )}
          {!value && existingUrl ? (
            <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">Current file</span>
          ) : null}
          {isEdited ? (
            <span className="absolute left-2 top-2 rounded bg-church-gold-warm px-2 py-0.5 text-xs text-white">Edited</span>
          ) : null}
        </div>

        {value ? (
          <div className="flex items-center gap-2 text-sm">
            {isVideo(value) ? (
              <Video className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <span className="min-w-0 flex-1 truncate font-medium">{value.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatFileSize(value.size)}
              {dimensions && !isVideo(value) ? ` · ${dimensions.width}×${dimensions.height}` : ""}
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {isEditable ? (
            <Button type="button" variant="outline" size="sm" onClick={startEditing} disabled={disabled}>
              <Crop className="mr-1.5 h-4 w-4" /> Crop & edit
            </Button>
          ) : null}
          {isEdited ? (
            <Button type="button" variant="ghost" size="sm" onClick={revert} disabled={disabled}>
              <Undo2 className="mr-1.5 h-4 w-4" /> Revert to original
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={disabled}>
            <Upload className="mr-1.5 h-4 w-4" /> {value || existingUrl ? "Replace" : "Choose file"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={disabled} className="text-destructive">
              <X className="mr-1.5 h-4 w-4" /> Remove
            </Button>
          ) : null}
        </div>
        {value?.type === "image/gif" ? (
          <p className="text-xs text-muted-foreground">Animated GIFs can't be edited here, so they upload as-is.</p>
        ) : null}
        {hiddenInput}
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !disabled) pick(file);
        }}
        className={cn(
          "flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-church-gold-warm hover:bg-church-gold-soft/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          dragging && "border-church-gold-warm bg-church-gold-soft/10"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium">Click to choose or drag a file here</span>
        <span className="text-xs text-muted-foreground">
          JPEG, PNG, WebP, GIF, MP4, WebM or MOV · up to {formatFileSize(maxBytes)}
        </span>
      </button>
      {hiddenInput}
      {errorMessage}
    </div>
  );
}

function EditorSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums">{display}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} aria-label={label} />
    </div>
  );
}
