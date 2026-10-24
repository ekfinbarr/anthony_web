import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GalleryAlbumItem } from "@/services/galleryAlbum.service";
import { mediaAlt, mediaKind } from "@/lib/gallery";

type GalleryLightboxProps = {
  items: GalleryAlbumItem[];
  open: boolean;
  index: number;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  albumTitle?: string;
};

const SWIPE_THRESHOLD = 50;

const GalleryLightbox = ({
  items,
  open,
  index,
  onOpenChange,
  onIndexChange,
  albumTitle,
}: GalleryLightboxProps) => {
  const current = items[index] ?? null;
  const kind = current ? mediaKind(current) : "other";
  const touchStartX = useRef<number | null>(null);
  const [imgErrorId, setImgErrorId] = useState<string | null>(null);
  const imgError = Boolean(current?.id && imgErrorId === current.id);

  const go = useCallback(
    (dir: "prev" | "next") => {
      if (!items.length) return;
      const next =
        dir === "next" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
      onIndexChange(next);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go("next");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) go("next");
    else go("prev");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-5xl border-0 bg-black/95 p-0 text-white [&>button]:hidden"
        aria-describedby={undefined}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">
          {current?.title ?? albumTitle ?? "Media viewer"}
          {items.length > 0 ? ` — ${index + 1} of ${items.length}` : ""}
        </DialogTitle>

        <div
          className="relative flex h-[min(85vh,900px)] w-full flex-col"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-20 text-white hover:bg-white/10"
            onClick={() => onOpenChange(false)}
            aria-label="Close viewer"
          >
            <X className="h-6 w-6" />
          </Button>

          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 text-white hover:bg-white/10 md:left-3"
                onClick={() => go("prev")}
                aria-label="Previous item"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 text-white hover:bg-white/10 md:right-3"
                onClick={() => go("next")}
                aria-label="Next item"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div className="flex flex-1 items-center justify-center p-4 md:p-8">
            {current?.media_url && !imgError ? (
              kind === "video" ? (
                <video
                  key={current.id}
                  className="max-h-full max-w-full rounded-md"
                  src={current.media_url}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={current.title}
                />
              ) : kind === "audio" ? (
                <div className="w-full max-w-xl rounded-lg bg-white/5 p-6">
                  <p className="mb-4 text-sm text-white/80">{current.title}</p>
                  <audio className="w-full" src={current.media_url} controls preload="metadata" />
                </div>
              ) : (
                <img
                  key={current.id}
                  className="max-h-full max-w-full rounded-md object-contain"
                  src={current.media_url}
                  alt={mediaAlt(current)}
                  onError={() => {
                    if (current.id) setImgErrorId(current.id);
                  }}
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 text-white/70">
                <ImageIcon className="h-12 w-12" aria-hidden="true" />
                <p className="text-sm">{imgError ? "This media could not be loaded." : "No media available."}</p>
              </div>
            )}
          </div>

          {current && (
            <div className="border-t border-white/10 bg-black/80 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold">{current.title}</h3>
                  {current.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-white/75">{current.description}</p>
                  ) : null}
                  {current.credit ? (
                    <p className="mt-1 text-xs text-white/55">Credit: {current.credit}</p>
                  ) : null}
                </div>
                {items.length > 0 && (
                  <p className="shrink-0 text-sm tabular-nums text-white/70" aria-live="polite">
                    {index + 1} of {items.length}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryLightbox;
