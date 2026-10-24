/**
 * Gallery Album Page (Public)
 *
 * Route: /gallery/:slug
 */

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Image as ImageIcon, MapPin, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SEOHead from "@/components/seo/SEOHead";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import GalleryAlbumCard from "@/components/gallery/GalleryAlbumCard";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import { site } from "@/config/site";
import {
  albumCoverSrc,
  albumDateLabel,
  formatMediaCounts,
  mediaAlt,
  mediaKind,
} from "@/lib/gallery";
import { cn } from "@/lib/utils";
import galleryAlbumService, { type GalleryAlbumItem } from "@/services/galleryAlbum.service";

const EMPTY_ITEMS: GalleryAlbumItem[] = [];

type MediaFilter = "all" | "photo" | "video";

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

  const relatedQuery = useQuery({
    queryKey: ["gallery-album", "related", safeSlug],
    queryFn: () => galleryAlbumService.getRelatedAlbums(safeSlug),
    enabled: !!safeSlug && !!data?.data,
  });

  const album = data?.data;
  const items = useMemo(() => album?.items ?? EMPTY_ITEMS, [album?.items]);

  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const photoCount = album?.photo_count ?? items.filter((i) => mediaKind(i) === "photo").length;
  const videoCount = album?.video_count ?? items.filter((i) => mediaKind(i) === "video").length;

  const filteredItems = useMemo(() => {
    if (mediaFilter === "all") return items;
    return items.filter((i) => mediaKind(i) === mediaFilter);
  }, [items, mediaFilter]);

  const path = `/gallery/${safeSlug}`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Gallery", path: "/gallery" },
    { name: album?.title ?? "Event", path },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-church-pearl/40">
        <SEOHead title="Photo Gallery" description={site.defaultDescription} path={path} />
        <div className="container mx-auto px-4 py-10">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-6 h-10 w-3/4 max-w-xl" />
          <Skeleton className="mt-4 h-5 w-2/3 max-w-lg" />
          <Skeleton className="mt-8 aspect-[21/9] w-full rounded-xl" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-church-pearl/40">
        <SEOHead title="Album Not Found" description="This gallery album could not be found." path={path} noindex />
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-lg rounded-xl border border-church-gold-warm/20 bg-white p-8 text-center shadow-sm">
            <h1 className="font-serif text-2xl font-semibold text-church-charcoal">Collection not found</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              This event may be unpublished or the link may be incorrect.
            </p>
            <div className="mt-6">
              <Button variant="church" asChild>
                <Link to="/gallery">Back to Gallery</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const coverImage = albumCoverSrc(album);
  const dateLabel = albumDateLabel(album);
  const countsLabel = formatMediaCounts(photoCount, videoCount, album.items_count ?? items.length);
  const related = relatedQuery.data?.data ?? [];

  const openAt = (filteredIdx: number) => {
    const item = filteredItems[filteredIdx];
    if (!item) return;
    const fullIdx = items.findIndex((i) => i.id === item.id);
    setLightboxIndex(fullIdx >= 0 ? fullIdx : filteredIdx);
    setLightboxOpen(true);
  };

  const filterTabs: { value: MediaFilter; label: string; count: number }[] = [
    { value: "all", label: "All Media", count: items.length },
    { value: "photo", label: "Photos", count: photoCount },
    { value: "video", label: "Videos", count: videoCount },
  ];

  return (
    <div className="min-h-screen bg-church-pearl/40">
      <SEOHead
        title={`${album.title} – Parish Gallery`}
        description={
          album.description?.trim() || `Photos and videos from ${album.title} at ${site.name}.`
        }
        path={path}
        image={coverImage || undefined}
        imageAlt={album.title}
      />

      <header className="border-b border-church-gold-warm/10 bg-white">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <Breadcrumbs items={crumbs} tone="onLight" />

          <div className="mt-6 grid gap-8 lg:grid-cols-5 lg:items-end">
            <div className="lg:col-span-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {(album.categories ?? []).map((c) => (
                  <Badge
                    key={c.id}
                    variant="outline"
                    className="border-church-gold-warm/30 font-normal text-church-gold-warm"
                  >
                    {c.label}
                  </Badge>
                ))}
                {album.is_featured ? (
                  <Badge className="bg-church-gold text-church-charcoal hover:bg-church-gold">Featured</Badge>
                ) : null}
              </div>

              <h1 className="font-serif text-3xl font-semibold leading-tight text-church-charcoal md:text-4xl">
                {album.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {dateLabel && <time dateTime={album.event_date ?? undefined}>{dateLabel}</time>}
                <span>{countsLabel}</span>
                {album.venue && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {album.venue}
                  </span>
                )}
              </div>

              {album.description ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {album.description}
                </p>
              ) : null}
            </div>

            {coverImage ? (
              <div className="overflow-hidden rounded-xl border border-church-gold-warm/15 lg:col-span-2">
                <img
                  src={coverImage}
                  alt=""
                  width={640}
                  height={400}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-10 md:py-12">
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter media in this event"
        >
          {filterTabs.map((tab) => {
            const active = mediaFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMediaFilter(tab.value)}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
                  active
                    ? "bg-church-charcoal text-church-pearl"
                    : "bg-white text-church-charcoal hover:bg-church-pearl",
                )}
              >
                {tab.label}
                <span className="ml-1.5 tabular-nums opacity-70">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-church-gold-warm/15 bg-white px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {mediaFilter === "all"
                ? "No published media in this collection yet."
                : `No ${mediaFilter === "photo" ? "photos" : "videos"} in this collection.`}
            </p>
            {mediaFilter !== "all" && (
              <Button variant="outline" className="mt-4" onClick={() => setMediaFilter("all")}>
                Show all media
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item, idx) => {
              const kind = mediaKind(item);
              const isVideo = kind === "video";
              const spanLarge = idx === 0 && filteredItems.length > 4 && mediaFilter === "all";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openAt(idx)}
                  className={cn(
                    "group relative overflow-hidden rounded-lg border border-church-gold-warm/10 bg-white text-left shadow-sm outline-none transition-[box-shadow,transform] duration-300",
                    "hover:shadow-md focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
                    "motion-safe:hover:-translate-y-0.5",
                    spanLarge && "col-span-2 row-span-2",
                  )}
                >
                  <div className={cn("relative bg-church-pearl", spanLarge ? "aspect-[4/3]" : "aspect-square")}>
                    {item.media_url ? (
                      isVideo ? (
                        <>
                          <video
                            src={item.media_url}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover opacity-80"
                            aria-hidden="true"
                          />
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white">
                              <Play className="h-5 w-5 fill-current" aria-hidden="true" />
                            </span>
                          </span>
                          <span className="sr-only">Video: {item.title}</span>
                        </>
                      ) : (
                        <img
                          src={item.media_url}
                          alt={mediaAlt(item)}
                          width={spanLarge ? 800 : 400}
                          height={spanLarge ? 600 : 400}
                          loading={idx < 4 ? "eager" : "lazy"}
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
                        />
                      )
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  {(item.title || item.description) && (
                    <div className="border-t border-church-gold-warm/10 px-3 py-2.5">
                      <p className="line-clamp-1 text-sm font-medium text-church-charcoal">{item.title}</p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="border-t border-church-gold-warm/10 bg-white py-12 md:py-14" aria-labelledby="related-heading">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 id="related-heading" className="font-serif text-2xl font-semibold text-church-charcoal md:text-3xl">
                Explore More Memories
              </h2>
              <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-church" aria-hidden="true" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((rel) => (
                <GalleryAlbumCard key={rel.id} album={rel} />
              ))}
            </div>
          </div>
        </section>
      )}

      <GalleryLightbox
        items={items}
        open={lightboxOpen}
        index={lightboxIndex}
        onOpenChange={setLightboxOpen}
        onIndexChange={setLightboxIndex}
        albumTitle={album.title}
      />
    </div>
  );
}
