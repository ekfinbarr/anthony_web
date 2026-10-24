import { useEffect, useId, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type ProofKind = "photo" | "pdf";

function proofKind(file: File): ProofKind | null {
  const type = file.type.toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (PHOTO_TYPES.has(type)) return "photo";
  if (type && type !== "application/octet-stream") return null;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "pdf";
  if (/\.(jpe?g|png|webp)$/.test(name)) return "photo";
  return null;
}

function proofError(file: File): string | null {
  if (file.size <= 0) return "Choose a file that is not empty.";
  if (file.size > MAX_BYTES) return "The file must be 10 MB or smaller.";
  if (!proofKind(file)) return "Upload a JPEG, PNG, or WebP photo, or a PDF.";
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The photo could not be opened."));
    image.src = src;
  });
}

async function cropToFile(src: string, pixels: Area, original: File): Promise<File> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(pixels.width));
  canvas.height = Math.max(1, Math.round(pixels.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The photo could not be cropped.");
  context.drawImage(image, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, canvas.width, canvas.height);
  const type = original.type === "image/png" || original.type === "image/webp" ? original.type : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("The photo could not be cropped."))), type, 0.92);
  });
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const base = original.name.replace(/\.[^.]+$/, "") || "receipt";
  return new File([blob], `${base}.${extension}`, { type });
}

export interface ProofFileFieldProps {
  id?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export default function ProofFileField({
  id,
  value,
  onChange,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}: ProofFileFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = useId();
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);

  useEffect(() => {
    if (!value || proofKind(value) !== "photo") {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCropFile(null);
    setPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const accept = (file: File) => {
    const reason = proofError(file);
    if (reason) {
      setMessage(reason);
      return;
    }
    setMessage("");
    if (proofKind(file) === "photo") {
      setCropFile(file);
      setCropSrc(URL.createObjectURL(file));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      return;
    }
    onChange(file);
  };

  const confirmCrop = async () => {
    if (!cropSrc || !cropFile || !pixels) return;
    setCropping(true);
    try {
      const cropped = await cropToFile(cropSrc, pixels, cropFile);
      const reason = proofError(cropped);
      if (reason) {
        setMessage(reason);
        return;
      }
      setMessage("");
      onChange(cropped);
      closeCrop();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The photo could not be cropped.");
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:border-primary"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          document.getElementById(inputId)?.click();
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) accept(file);
        }}
      >
        {value ? (
          <div className="flex items-center gap-3 text-left">
            {previewUrl ? (
              <img src={previewUrl} alt="" className="h-16 w-16 rounded-md border object-cover" />
            ) : (
              <FileText className="h-10 w-10 shrink-0 text-muted-foreground" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{value.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(value.size)}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} aria-label="Remove file">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="mb-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
            <p className="mb-3 text-xs text-muted-foreground">JPEG, PNG, WebP, or PDF, up to 10 MB</p>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="sr-only"
          aria-invalid={ariaInvalid || Boolean(message) || undefined}
          aria-describedby={[ariaDescribedBy, message ? messageId : ""].filter(Boolean).join(" ") || undefined}
          aria-required={ariaRequired || undefined}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) accept(file);
          }}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById(inputId)?.click()}>
          {value ? "Change file" : "Choose file"}
        </Button>
      </div>
      {message && <p id={messageId} role="alert" className="text-sm text-destructive">{message}</p>}

      <Dialog open={Boolean(cropSrc)} onOpenChange={(open) => { if (!open && !cropping) closeCrop(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop receipt</DialogTitle>
            <DialogDescription>Move and zoom the photo, then keep the part that shows the payment.</DialogDescription>
          </DialogHeader>
          <div className="relative h-72 overflow-hidden rounded-md bg-muted">
            {cropSrc && (
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, nextPixels) => setPixels(nextPixels)}
              />
            )}
          </div>
          <label className="flex items-center gap-3 text-sm">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCrop} disabled={cropping}>Cancel</Button>
            <Button type="button" variant="church" onClick={confirmCrop} disabled={cropping || !pixels}>
              {cropping ? "Cropping…" : "Use this crop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
