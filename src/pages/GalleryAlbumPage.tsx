/**
 * Gallery Album Page (Public)
 *
 * Shows a single album and its media items with a lightbox viewer.
 *
 * Route:
 * - /gallery/:slug
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import galleryAlbumService, { GalleryAlbumItem } from "@/services/galleryAlbum.service";

const EMPTY_ITEMS: GalleryAlbumItem[] = [];

function isVideo(filetype?: string | null) {
  return typeof filetype === "string" && filetype.startsWith("video/");
}

function isAudio(filetype?: string | null) {
  return typeof filetype === "string" && filetype.startsWith("audio/");
}

export default function GalleryAlbumPage() {
  const { slug } = useParams<{ slug: string }>();
  const safeSlug = slug ?? "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["gallery-album", "public", safeSlug],
    queryFn: async () => {
      if (!safeSlug) throw new Error("Missing album slug");
      return await galleryAlbumService.getPublicAlbum(safeSlug);
    },
    enabled: !!safeSlug,
  });

  const album = data?.data;
  const items = useMemo<GalleryAlbumItem[]>(() => album?.items ?? EMPTY_ITEMS, [album?.items]);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = useMemo(() => items[currentIndex] ?? null, [items, currentIndex]);

  const openAt = (idx: number) => {
    setCurrentIndex(idx);
    setLightboxOpen(true);
  };

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      if (!items.length) return;
      const nextIndex = dir === "next" ? (currentIndex + 1) % items.length : (currentIndex - 1 + items.length) % items.length;
      setCurrentIndex(nextIndex);
    },
    [currentIndex, items.length]
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") navigate("prev");
      if (e.key === "ArrowRight") navigate("next");
    },
    [lightboxOpen, navigate]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, onKeyDown]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <section className="border-b">
          <div className="container py-10">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-10 w-3/4" />
            <Skeleton className="mt-3 h-5 w-2/3" />
          </div>
        </section>
        <section className="container py-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-background">
        <section className="container py-16">
          <Card className="p-6">
            <p className="text-sm text-destructive">Album not found (or failed to load).</p>
            <div className="mt-4">
              <Link to="/gallery">
                <Button variant="outline">Back to Gallery</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10" />
        <div className="container relative py-10 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <Link to="/gallery" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" />
                Back to Gallery
              </Link>
              <h1 className="font-heading text-3xl font-bold text-church-charcoal md:text-4xl">{album.title}</h1>
              {album.description ? <p className="max-w-2xl text-muted-foreground">{album.description}</p> : null}

              <div className="flex flex-wrap gap-2 pt-1">
                {(album.categories ?? []).map((c) => (
                  <Badge key={c.id} variant="outline" className="font-normal">
                    {c.label}
                  </Badge>
                ))}
                {(album.tags ?? []).map((t) => (
                  <Badge key={t.id} variant="outline" className="font-normal">
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{items.length} items</Badge>
              {album.is_featured ? <Badge>Featured</Badge> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Items */}
      <section className="container py-10 md:py-12">
        {items.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No items yet.</p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openAt(idx)}
                className="group text-left"
              >
                <Card className="overflow-hidden transition hover:shadow-lg">
                  <div className="relative">
                    {item.media_url ? (
                      isVideo(item.filetype) ? (
                        <div className="relative flex h-44 w-full items-center justify-center bg-black">
                          <Play className="absolute z-10 h-12 w-12 text-white/90" />
                          <video className="h-44 w-full object-cover opacity-60" src={item.media_url} muted preload="metadata" />
                        </div>
                      ) : (
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      )
                    ) : (
                      <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      {isVideo(item.filetype) ? <Badge>Video</Badge> : null}
                      {isAudio(item.filetype) ? <Badge>Audio</Badge> : null}
                    </div>
                  </div>

                  <div className="space-y-1 p-4">
                    <h3 className="line-clamp-1 font-heading text-base font-semibold text-church-charcoal">{item.title}</h3>
                    {item.description ? <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p> : null}
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 text-white">
          <div className="relative flex h-[85vh] w-full items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 z-10 text-white hover:bg-white/10"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/10"
              onClick={() => navigate("prev")}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-white hover:bg-white/10"
              onClick={() => navigate("next")}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>

            <div className="flex h-full w-full items-center justify-center p-6">
              {currentItem?.media_url ? (
                isVideo(currentItem.filetype) ? (
                  <video className="max-h-full max-w-full rounded-lg" src={currentItem.media_url} controls />
                ) : isAudio(currentItem.filetype) ? (
                  <div className="w-full max-w-xl rounded-lg bg-white/5 p-6">
                    <p className="mb-4 text-sm text-white/80">{currentItem.title}</p>
                    <audio className="w-full" src={currentItem.media_url} controls />
                  </div>
                ) : (
                  <img className="max-h-full max-w-full rounded-lg object-contain" src={currentItem.media_url} alt={currentItem.title} />
                )
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-white/5">
                  <ImageIcon className="h-12 w-12 text-white/70" />
                </div>
              )}
            </div>

            {currentItem ? (
              <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{currentItem.title}</h3>
                    {currentItem.description ? <p className="mt-1 text-sm text-white/75">{currentItem.description}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.filetype ? <Badge variant="secondary">{currentItem.filetype}</Badge> : null}
                    {currentItem.filename ? <Badge variant="secondary">{currentItem.filename}</Badge> : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


