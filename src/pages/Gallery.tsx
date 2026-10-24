import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import GalleryAlbumCard from "@/components/gallery/GalleryAlbumCard";
import GalleryFeatured from "@/components/gallery/GalleryFeatured";
import GalleryFilters from "@/components/gallery/GalleryFilters";
import GalleryMediaCard from "@/components/gallery/GalleryMediaCard";
import GalleryEmptyState from "@/components/gallery/GalleryEmptyState";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";
import categoryService from "@/services/category.service";
import galleryAlbumService, {
  type GalleryAlbum,
  type GalleryAlbumItem,
  type GalleryAlbumSort,
  type GalleryMediaTypeFilter,
} from "@/services/galleryAlbum.service";

const PER_PAGE = 12;

const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const categoryId = searchParams.get("category") || "";
  const year = searchParams.get("year") || "";
  const typeParam = searchParams.get("type") || "";
  const mediaType: "" | GalleryMediaTypeFilter =
    typeParam === "photo" || typeParam === "video" ? typeParam : "";
  const sortParam = searchParams.get("sort") || "newest";
  const sort: GalleryAlbumSort =
    sortParam === "oldest" || sortParam === "featured" ? sortParam : "newest";
  const qParam = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(() => qParam);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === qParam) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next) params.set("q", next);
          else params.delete("q");
          params.delete("page");
          return params;
        },
        { replace: true },
      );
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput, qParam, setSearchParams]);

  const updateParams = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        });
        if (resetPage) params.delete("page");
        return params;
      });
    },
    [setSearchParams],
  );

  const hasActiveFilters = Boolean(categoryId || year || mediaType || qParam || sort !== "newest");
  const showCollections = !mediaType;
  const showFeatured = showCollections && !hasActiveFilters && page === 1;

  const yearsQuery = useQuery({
    queryKey: ["gallery-albums", "years"],
    queryFn: () => galleryAlbumService.listPublicYears(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories", "active"],
    queryFn: () => categoryService.list({ active: true }),
  });

  const featuredQuery = useQuery({
    queryKey: ["gallery-albums", "featured-hero"],
    queryFn: async () => {
      const featured = await galleryAlbumService.listPublicAlbums({
        is_featured: true,
        sort: "newest",
        per_page: 1,
      });
      if (featured.data?.[0]) return featured.data[0];
      const latest = await galleryAlbumService.listPublicAlbums({ sort: "newest", per_page: 1 });
      return latest.data?.[0] ?? null;
    },
    enabled: showFeatured,
  });

  const albumsQuery = useQuery({
    queryKey: ["gallery-albums", "public", page, categoryId, year, qParam, sort],
    queryFn: () =>
      galleryAlbumService.listPublicAlbums({
        page,
        per_page: PER_PAGE,
        search: qParam || undefined,
        category_id: categoryId || undefined,
        year: year || undefined,
        sort,
      }),
    enabled: showCollections,
    placeholderData: (prev) => prev,
  });

  const mediaQuery = useQuery({
    queryKey: ["gallery-albums", "media", page, mediaType, categoryId, year, qParam],
    queryFn: () =>
      galleryAlbumService.listPublicMedia({
        page,
        per_page: PER_PAGE,
        type: mediaType || undefined,
        search: qParam || undefined,
        category_id: categoryId || undefined,
        year: year || undefined,
      }),
    enabled: !showCollections,
    placeholderData: (prev) => prev,
  });

  const albums: GalleryAlbum[] = albumsQuery.data?.data ?? [];
  const mediaItems: GalleryAlbumItem[] = mediaQuery.data?.data ?? [];
  const featured = featuredQuery.data ?? null;
  const activeQuery = showCollections ? albumsQuery : mediaQuery;
  const lastPage = activeQuery.data?.meta?.last_page ?? 1;
  const total = activeQuery.data?.meta?.total ?? 0;

  const listWithoutFeatured = useMemo(() => {
    if (!showFeatured || !featured) return albums;
    return albums.filter((a) => a.id !== featured.id);
  }, [albums, featured, showFeatured]);

  const categoryOptions = useMemo(
    () =>
      (categoriesQuery.data?.data ?? []).map((c) => ({
        id: c.id,
        label: c.label,
      })),
    [categoriesQuery.data],
  );

  const isEmptyFeed = !activeQuery.isLoading && !activeQuery.isError && total === 0 && !hasActiveFilters;
  const isNoResults = !activeQuery.isLoading && !activeQuery.isError && total === 0 && hasActiveFilters;

  const openMediaAt = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-church-pearl/40">
      <SEOHead
        title="Parish Gallery"
        description="Explore photographs and videos from the life of St. Anthony Catholic Church, Gbaja — sacred celebrations, fellowship, and service."
        path="/gallery"
      />

      <PageHeader
        eyebrow="LIFE IN OUR PARISH"
        title="Moments of Faith & Community"
        description="From sacred celebrations to moments of fellowship and service, explore the memories that bring our parish community together."
        size="compact"
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <GalleryFilters
            search={searchInput}
            onSearchChange={setSearchInput}
            onClearSearch={() => {
              setSearchInput("");
              updateParams({ q: null });
            }}
            categories={categoryOptions}
            categoryId={categoryId}
            onCategoryChange={(id) => updateParams({ category: id || null })}
            years={yearsQuery.data ?? []}
            year={year}
            onYearChange={(y) => updateParams({ year: y || null })}
            mediaType={mediaType}
            onMediaTypeChange={(t) => updateParams({ type: t || null })}
            sort={sort}
            onSortChange={(s) => updateParams({ sort: s === "newest" ? null : s })}
          />

          {showFeatured && featured && !featuredQuery.isLoading && <GalleryFeatured album={featured} />}

          {featuredQuery.isLoading && showFeatured && (
            <Skeleton className="mb-14 h-72 w-full rounded-xl" />
          )}

          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-church-charcoal md:text-3xl">
                {showCollections ? "Event Collections" : mediaType === "video" ? "Videos" : "Photos"}
              </h2>
              <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-church" aria-hidden="true" />
            </div>
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                {total} {showCollections ? (total === 1 ? "collection" : "collections") : total === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {activeQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 w-full rounded-lg" />
              ))}
            </div>
          ) : activeQuery.isError ? (
            <GalleryEmptyState variant="error" onRetry={() => activeQuery.refetch()} />
          ) : isEmptyFeed ? (
            <GalleryEmptyState variant="empty" />
          ) : isNoResults ? (
            <GalleryEmptyState
              variant="no-results"
              onClearFilters={() => {
                setSearchInput("");
                setSearchParams({});
              }}
            />
          ) : showCollections ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listWithoutFeatured.map((album, i) => (
                <GalleryAlbumCard
                  key={album.id}
                  album={album}
                  featuredLayout={i === 0 && listWithoutFeatured.length > 3 && page === 1}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaItems.map((item, idx) => (
                <GalleryMediaCard key={item.id} item={item} onOpen={() => openMediaAt(idx)} />
              ))}
            </div>
          )}

          {lastPage > 1 && !activeQuery.isError && total > 0 && (
            <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Gallery pagination">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) }, false)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => updateParams({ page: String(page + 1) }, false)}
              >
                Next
              </Button>
            </nav>
          )}
        </div>
      </section>

      {!showCollections && (
        <GalleryLightbox
          items={mediaItems}
          open={lightboxOpen}
          index={lightboxIndex}
          onOpenChange={setLightboxOpen}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default Gallery;
