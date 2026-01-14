import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Image as ImageIcon, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import categoryService, { Category } from "@/services/category.service";
import tagService, { Tag } from "@/services/tag.service";
import galleryAlbumService, { GalleryAlbum } from "@/services/galleryAlbum.service";

type FilterState = {
  search: string;
  categoryId: string;
  tagId: string;
  featuredOnly: boolean;
};

const Gallery = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    categoryId: "all",
    tagId: "all",
    featuredOnly: false,
  });

  const albumQueryParams = useMemo(() => {
    return {
      search: filters.search || undefined,
      category_id: filters.categoryId !== "all" ? filters.categoryId : undefined,
      tag_id: filters.tagId !== "all" ? filters.tagId : undefined,
      is_featured: filters.featuredOnly ? true : undefined,
      per_page: 24,
    };
  }, [filters]);

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", "active"],
    queryFn: () => categoryService.list({ active: true }),
  });

  const { data: tagsData, isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags", "active"],
    queryFn: () => tagService.list({ active: true }),
  });

  const {
    data: albumsData,
    isLoading: isLoadingAlbums,
    error: albumsError,
  } = useQuery({
    queryKey: ["gallery-albums", "public", albumQueryParams],
    queryFn: () => galleryAlbumService.listPublicAlbums(albumQueryParams),
  });

  const categories: Category[] = categoriesData?.data ?? [];
  const tags: Tag[] = tagsData?.data ?? [];
  const albums: GalleryAlbum[] = albumsData?.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10" />
        <div className="container relative py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur">
              <ImageIcon className="h-4 w-4" />
              Albums & highlights from parish life
            </div>

            <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-church-charcoal md:text-5xl">
              Gallery Albums
          </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Browse celebrations and moments—Harvest, Galilee Day, sacraments, outreaches, and more—organized into albums for easy viewing.
          </p>
        </div>

          {/* Filters */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
                <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.search}
                  onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                  placeholder="Search albums…"
                  className="pl-9"
                />
                      </div>
                    </div>

            <div className="md:col-span-3">
              <Select
                value={filters.categoryId}
                onValueChange={(v) => setFilters((p) => ({ ...p, categoryId: v }))}
                disabled={isLoadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                  </div>

            <div className="md:col-span-3">
              <Select value={filters.tagId} onValueChange={(v) => setFilters((p) => ({ ...p, tagId: v }))} disabled={isLoadingTags}>
                <SelectTrigger>
                  <SelectValue placeholder="Tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {tags.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                </div>

            <div className="md:col-span-12 flex flex-wrap items-center justify-between gap-3">
              <Button
                variant={filters.featuredOnly ? "default" : "outline"}
                onClick={() => setFilters((p) => ({ ...p, featuredOnly: !p.featuredOnly }))}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Featured
              </Button>

              <div className="text-sm text-muted-foreground">
                {isLoadingAlbums ? "Loading albums…" : `${albums.length} album${albums.length === 1 ? "" : "s"}`}
              </div>
                </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container py-10 md:py-12">
        {albumsError ? (
          <Card className="p-6">
            <p className="text-sm text-destructive">Failed to load albums. Please try again.</p>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoadingAlbums
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-44 w-full" />
                    <div className="space-y-3 p-4">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </Card>
                ))
              : albums.map((album) => (
                  <Link key={album.id} to={`/gallery/${album.slug}`} className="group">
                    <Card className="overflow-hidden transition hover:shadow-lg">
                      <div className="relative">
                        {album.cover_url ? (
                          <img
                            src={album.cover_url}
                            alt={album.title}
                            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                    />
                  ) : (
                          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          {album.is_featured ? <Badge>Featured</Badge> : null}
                          {!album.is_published ? <Badge variant="secondary">Unpublished</Badge> : null}
            </div>

                        <div className="absolute bottom-3 right-3">
                          <Badge variant="secondary">{album.items_count ?? 0} items</Badge>
                </div>
              </div>

                      <div className="space-y-2 p-4">
                        <h3 className="line-clamp-1 font-heading text-lg font-semibold text-church-charcoal">{album.title}</h3>
                        {album.description ? (
                          <p className="line-clamp-2 text-sm text-muted-foreground">{album.description}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Open album</p>
                        )}

                        <div className="flex flex-wrap gap-2 pt-1">
                          {(album.categories ?? []).slice(0, 2).map((c) => (
                            <Badge key={c.id} variant="outline" className="font-normal">
                              {c.label}
                            </Badge>
                          ))}
                          {(album.tags ?? []).slice(0, 1).map((t) => (
                            <Badge key={t.id} variant="outline" className="font-normal">
                              {t.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Gallery;