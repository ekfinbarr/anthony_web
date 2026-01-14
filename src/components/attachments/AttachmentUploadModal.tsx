/**
 * AttachmentUploadModal
 *
 * A reusable, beautiful upload modal for attachments (image / video / audio / file).
 * - Drag & drop OR click-to-select
 * - Optional "Paste URL instead" (useful for externally hosted videos)
 * - Uploads via backend Attachments API (`POST /api/attachments`)
 * - Resolves and returns the final public URL (`GET /api/attachments/{id}/url`)
 *
 * Integration:
 * - Provide `relatedType` + `relatedId` (backend requires both)
 * - Listen to `onUploaded(url, meta)` to set form fields (e.g. post image/video URL)
 *
 * @package Lovable/src/components/attachments
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { uploadAndGetUrl } from "@/services/attachment.service";
import { File as FileIcon, Image as ImageIcon, Link2, Loader2, Music, Upload, Video } from "lucide-react";

/**
 * Attachment kinds supported by the modal.
 * - "file": any file type (PDF, DOCX, etc.)
 * - "any": all kinds (same as "file" but also shows nicer icon mapping)
 */
export type AttachmentKind = "image" | "video" | "audio" | "file" | "any";

export interface AttachmentUploadedMeta {
  /** Attachment database id (if uploaded via API). */
  attachmentId?: string;
  /** Original filename (if uploaded via file). */
  filename?: string;
  /** Browser mime type (if uploaded via file). */
  mimeType?: string;
  /** File size in bytes (if uploaded via file). */
  size?: number;
  /** Whether URL came from upload or was pasted. */
  source: "upload" | "url";
}

export interface AttachmentUploadModalProps {
  /** Controls the Radix Dialog. */
  open: boolean;
  /** Called when the dialog opens/closes. */
  onOpenChange: (open: boolean) => void;

  /** Modal header title. */
  title?: string;
  /** Modal helper description. */
  description?: string;

  /**
   * Required by backend API to associate uploads with an entity.
   * Example: relatedType="post", relatedId=postId OR relatedId=draftId
   */
  relatedType: string;
  relatedId: string;

  /** Allowed kinds. If omitted, defaults to ["any"]. */
  kinds?: AttachmentKind[];

  /** Max upload size in MB (defaults to 50MB, matching backend). */
  maxSizeMb?: number;

  /** Enables the "Paste URL" tab (recommended for videos). */
  allowUrlPaste?: boolean;

  /**
   * Fires after a successful upload (or URL paste).
   * Use this to populate your form field with the returned URL.
   */
  onUploaded: (url: string, meta: AttachmentUploadedMeta) => void;
}

/**
 * Small helper to map a mime type / kind to an icon.
 */
function KindIcon({ kind }: { kind: AttachmentKind }) {
  if (kind === "image") return <ImageIcon className="h-5 w-5" />;
  if (kind === "video") return <Video className="h-5 w-5" />;
  if (kind === "audio") return <Music className="h-5 w-5" />;
  return <FileIcon className="h-5 w-5" />;
}

/**
 * Determine if a file matches allowed kinds.
 */
function isFileAllowed(file: File, kinds: AttachmentKind[]) {
  // "any" or "file" means: accept everything (backend will still enforce max size).
  if (kinds.includes("any") || kinds.includes("file")) return true;
  if (kinds.includes("image") && file.type.startsWith("image/")) return true;
  if (kinds.includes("video") && file.type.startsWith("video/")) return true;
  if (kinds.includes("audio") && file.type.startsWith("audio/")) return true;
  return false;
}

/**
 * Convert `kinds` into the native file input accept string.
 */
function kindsToAccept(kinds: AttachmentKind[]) {
  if (kinds.includes("any") || kinds.includes("file")) return undefined;
  const accept: string[] = [];
  if (kinds.includes("image")) accept.push("image/*");
  if (kinds.includes("video")) accept.push("video/*");
  if (kinds.includes("audio")) accept.push("audio/*");
  return accept.join(",") || undefined;
}

export default function AttachmentUploadModal({
  open,
  onOpenChange,
  title = "Upload Attachment",
  description = "Upload a file or paste a URL. When complete, we’ll return the final URL you can store in your form.",
  relatedType,
  relatedId,
  kinds = ["any"],
  maxSizeMb = 50,
  allowUrlPaste = false,
  onUploaded,
}: AttachmentUploadModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for file-mode
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Local state for URL-mode
  const [pastedUrl, setPastedUrl] = useState("");

  const maxSizeBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb]);
  const accept = useMemo(() => kindsToAccept(kinds), [kinds]);

  /**
   * Reset internal modal state on close.
   * Keeps the modal reusable and avoids stale previews when opened again.
   */
  const reset = () => {
    setSelectedFile(null);
    setPastedUrl("");
    setIsDragging(false);
    setProgress(0);
    setIsUploading(false);
  };

  // Clean up object URL (browser memory safety).
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Reset when modal closes.
  useEffect(() => {
    if (!open) {
      reset();
      setPreviewUrl(null);
    }
  }, [open]);

  const handleFileSelect = (file: File) => {
    // Validate kind
    if (!isFileAllowed(file, kinds)) {
      toast({
        title: "Unsupported file type",
        description: `Please upload one of: ${kinds.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Max allowed size is ${maxSizeMb}MB`,
        variant: "destructive",
      });
      return;
    }

    // Create a local preview URL (works for image/video/audio in-browser).
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objectUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Choose a file to upload.", variant: "destructive" });
      return;
    }

    // We can’t track real upload progress with fetch easily, so we show a smooth “feel-good” progress.
    setIsUploading(true);
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10));
    }, 200);

    try {
      const res = await uploadAndGetUrl(
        {
          file: selectedFile,
          related_type: relatedType,
          related_id: relatedId
        },
        {
          temporary: false
        }
      );

      setProgress(100);
      onUploaded(res.url, {
        attachmentId: res.attachmentId,
        filename: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        source: "upload",
      });

      toast({ title: "Uploaded", description: "Attachment uploaded successfully." });
      onOpenChange(false);
    } catch (e: unknown) {
      let errorMessage = "Upload failed";
      
      if (e instanceof Error) {
        errorMessage = e.message;
        
        // Provide more helpful error messages for common issues
        if (errorMessage.includes("upload_max_filesize") || errorMessage.includes("post_max_size")) {
          errorMessage = `File is too large. The server has a size limit. Please upload a smaller file (max ${maxSizeMb}MB recommended) or contact your administrator to increase PHP upload limits.`;
        } else if (errorMessage.includes("exceeds maximum")) {
          errorMessage = errorMessage + `. Maximum allowed size is ${maxSizeMb}MB.`;
        } else if (errorMessage.includes("error_code")) {
          errorMessage = "File upload error: The file may be too large or corrupted. Please try a smaller file.";
        }
      }
      
      toast({ 
        title: "Upload failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
      setProgress(0);
    } finally {
      window.clearInterval(progressTimer);
      setIsUploading(false);
    }
  };

  const handleConfirmUrl = () => {
    const url = pastedUrl.trim();
    if (!url) {
      toast({ title: "Missing URL", description: "Paste a URL to continue.", variant: "destructive" });
      return;
    }
    try {
      // Basic URL validation (prevents obvious mistakes like "example" without protocol)
      // This doesn't block relative URLs, but it nudges toward correct usage.
      new URL(url);
    } catch {
      toast({ title: "Invalid URL", description: "Please provide a valid URL (e.g. https://...)", variant: "destructive" });
      return;
    }

    onUploaded(url, { source: "url" });
    toast({ title: "Attached", description: "URL attached successfully." });
    onOpenChange(false);
  };

  /**
   * The “best matching” kind icon for the current modal configuration.
   * Used in the dropzone for a friendly visual cue.
   */
  const primaryKind: AttachmentKind = useMemo(() => {
    // Prefer a more specific kind over "any".
    const preferredOrder: AttachmentKind[] = ["image", "video", "audio", "file", "any"];
    return preferredOrder.find((k) => kinds.includes(k)) ?? "any";
  }, [kinds]);

  const renderPreview = () => {
    if (!selectedFile || !previewUrl) return null;
    if (selectedFile.type.startsWith("image/")) {
      return <img src={previewUrl} alt="Preview" className="h-48 w-full rounded-lg object-cover border" />;
    }
    if (selectedFile.type.startsWith("video/")) {
      return (
        <video src={previewUrl} controls className="h-48 w-full rounded-lg border bg-black" />
      );
    }
    if (selectedFile.type.startsWith("audio/")) {
      return (
        <div className="rounded-lg border p-4">
          <audio src={previewUrl} controls className="w-full" />
        </div>
      );
    }
    return (
      <div className="rounded-lg border p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
          <div className="min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{Math.round(selectedFile.size / 1024)} KB</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KindIcon kind={primaryKind} />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2" disabled={!allowUrlPaste}>
              <Link2 className="h-4 w-4" />
              Paste URL
            </TabsTrigger>
          </TabsList>

          {/* Upload tab */}
          <TabsContent value="file" className="mt-4 space-y-4">
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer",
                "bg-gradient-to-b from-background to-muted/30",
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
              )}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={cn("h-12 w-12 rounded-full grid place-items-center", isDragging ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-medium">
                  Drag and drop, or <span className="text-primary">click to select</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Max {maxSizeMb}MB. Allowed: {kinds.join(", ")}
                </p>
              </div>

              {/* Hidden file input (native picker) */}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Preview (if any) */}
            {renderPreview()}

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Attempt to remove server-side attachment if we already uploaded.
                  // (No-op; upload is only triggered when user clicks Upload.)
                  reset();
                  setPreviewUrl(null);
                }}
                disabled={isUploading}
              >
                Clear
              </Button>
              <Button type="button" onClick={handleUpload} disabled={!selectedFile || isUploading} className="gap-2">
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload & Use URL
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* URL tab */}
          <TabsContent value="url" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attachment-url">Attachment URL</Label>
              <Input
                id="attachment-url"
                placeholder="https://example.com/video.mp4"
                value={pastedUrl}
                onChange={(e) => setPastedUrl(e.target.value)}
                disabled={!allowUrlPaste}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use this for externally hosted media (YouTube/Vimeo/Cloud storage links).
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setPastedUrl("")}>
                Clear
              </Button>
              <Button type="button" onClick={handleConfirmUrl} className="gap-2">
                <Link2 className="h-4 w-4" />
                Use URL
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>

        {/* Helpful footer note: this helps devs understand the linkage requirement quickly. */}
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Dev note:</span>{" "}
            uploads are saved as attachments linked by{" "}
            <code className="px-1 py-0.5 rounded bg-background border">related_type</code> and{" "}
            <code className="px-1 py-0.5 rounded bg-background border">related_id</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}


