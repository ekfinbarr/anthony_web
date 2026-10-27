import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Mic2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import sermonService, { type Sermon, type SermonQueryParams } from "@/services/sermon.service";
import SermonCard from "@/components/sermons/SermonCard";
import SermonDetailModal from "@/components/sermons/SermonDetailModal";
import SermonFeaturedHero from "@/components/sermons/SermonFeaturedHero";
import SermonsPagination from "@/components/sermons/SermonsPagination";
import SermonsToolbar, {
  type MediaFilterValue,
  type SermonSortValue,
} from "@/components/sermons/SermonsToolbar";
import { sermonMediaKinds } from "@/components/sermons/sermonMedia";
import { PulpitIcon } from "@/components/icons/ParishIcons";
import { useIsMobile } from "@/hooks/use-mobile";

const PER_PAGE = 12;

function parseSort(value: string | null): SermonSortValue {
  const allowed: SermonSortValue[] = [
    "preached_date:desc",
    "preached_date:asc",
    "view_count:desc",
    "title:asc",
    "title:desc",
  ];
  if (value && allowed.includes(value as SermonSortValue)) return value as SermonSortValue;
  return "preached_date:desc";
}

const Sermons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const searchInput = searchParams.get("q") ?? "";
  const series = searchParams.get("series") ?? "all";
  const speaker = searchParams.get("speaker") ?? "all";
  const sort = parseSort(searchParams.get("sort"));
  const mediaFilter = (searchParams.get("media") as MediaFilterValue) || "all";
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const modalSlug = searchParams.get("sermon");

  const [searchDraft, setSearchDraft] = useState(searchInput);
  const debouncedSearch = useDebouncedValue(searchDraft, 350);

  // Follow URL changes (back/forward, cleared filters) by adjusting during render.
  const [syncedSearchInput, setSyncedSearchInput] = useState(searchInput);
  if (searchInput !== syncedSearchInput) {
    setSyncedSearchInput(searchInput);
    setSearchDraft(searchInput);
  }

  const patchParams = useCallback(
    (patch: Record<string, string | null>, options?: { resetPage?: boolean }) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) => {
            if (value === null || value === "" || value === "all") next.delete(key);
            else next.set(key, value);
          });
          if (options?.resetPage !== false && !("page" in patch)) {
            next.delete("page");
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (debouncedSearch === searchInput) return;
    patchParams({ q: debouncedSearch || null });
  }, [debouncedSearch, searchInput, patchParams]);

  const [sortField, sortOrder] = sort.split(":") as [SermonQueryParams["sort"], "asc" | "desc"];

  const listParams: SermonQueryParams = useMemo(
    () => ({
      page,
      per_page: PER_PAGE,
      only_published: true,
      search: debouncedSearch || undefined,
      series: series !== "all" ? series : undefined,
      speaker: speaker !== "all" ? speaker : undefined,
      sort: sortField,
      order: sortOrder,
    }),
    [page, debouncedSearch, series, speaker, sortField, sortOrder],
  );

  const {
    data: sermonsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["sermons", "public", listParams],
    queryFn: () => sermonService.list(listParams),
    placeholderData: (prev) => prev,
  });

  const { data: featuredList = [], isLoading: featuredLoading } = useQuery({
    queryKey: ["sermons", "featured"],
    queryFn: () => sermonService.getFeatured(),
  });

  const { data: latestList = [] } = useQuery({
    queryKey: ["sermons", "latest", 1],
    queryFn: () => sermonService.getLatest({ limit: 1 }),
  });

  const { data: seriesOptions = [] } = useQuery({
    queryKey: ["sermons", "series"],
    queryFn: () => sermonService.getSeries(),
  });

  const { data: speakerOptions = [] } = useQuery({
    queryKey: ["sermons", "speakers"],
    queryFn: () => sermonService.getSpeakers(),
  });

  const featuredSermon = featuredList[0] ?? latestList[0] ?? null;

  const sermons = useMemo(() => {
    const rows = sermonsData?.data ?? [];
    if (mediaFilter === "all") return rows;
    return rows.filter((s) => sermonMediaKinds(s).includes(mediaFilter));
  }, [sermonsData?.data, mediaFilter]);

  const [preview, setPreview] = useState<Sermon | null>(null);

  const openSermon = (sermon: Sermon) => {
    setPreview(sermon);
    patchParams({ sermon: sermon.slug }, { resetPage: false });
  };

  const closeModal = (open: boolean) => {
    if (!open) {
      setPreview(null);
      patchParams({ sermon: null }, { resetPage: false });
    }
  };

  const layout = isMobile ? "list" : "grid";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Sermons"
        description="Watch, listen, and grow with our message library"
        eyebrow="Homilies & teachings"
      />

      <SermonFeaturedHero
        sermon={featuredSermon}
        isLoading={featuredLoading}
        onOpen={openSermon}
      />

      <section className="py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <SermonsToolbar
              search={searchDraft}
              onSearchChange={setSearchDraft}
              series={series}
              onSeriesChange={(v) => patchParams({ series: v })}
              speaker={speaker}
              onSpeakerChange={(v) => patchParams({ speaker: v })}
              sort={sort}
              onSortChange={(v) => patchParams({ sort: v })}
              mediaFilter={mediaFilter === "all" || mediaFilter === "video" || mediaFilter === "audio" || mediaFilter === "notes" ? mediaFilter : "all"}
              onMediaFilterChange={(v) => patchParams({ media: v })}
              seriesOptions={seriesOptions}
              speakerOptions={speakerOptions}
              className="mb-8"
            />

            {isLoading ? (
              <div
                className={
                  layout === "list"
                    ? "space-y-3"
                    : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className={layout === "list" ? "h-28 w-full rounded-xl" : "aspect-[4/5] w-full rounded-xl"}
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
                <p className="text-destructive">Could not load sermons.</p>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            ) : sermons.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
                <PulpitIcon size="lg" className="mb-4 opacity-70" />
                <h3 className="font-heading text-xl font-semibold text-church-charcoal">No sermons found</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Try a different search, series, or speaker filter.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setSearchDraft("");
                    patchParams({ q: null, series: null, speaker: null, media: null, sort: null });
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {sermonsData?.total ?? sermons.length} message
                    {(sermonsData?.total ?? sermons.length) === 1 ? "" : "s"}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">
                    <Mic2 className="h-3.5 w-3.5" />
                    List view
                  </span>
                </div>

                <div
                  className={
                    layout === "list"
                      ? "space-y-3"
                      : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  }
                >
                  {sermons.map((sermon, index) => (
                    <SermonCard
                      key={sermon.id}
                      sermon={sermon}
                      layout={layout}
                      index={index}
                      onSelect={openSermon}
                    />
                  ))}
                </div>

                <SermonsPagination
                  currentPage={sermonsData?.current_page ?? page}
                  lastPage={sermonsData?.last_page ?? 1}
                  total={sermonsData?.total}
                  from={sermonsData?.from}
                  to={sermonsData?.to}
                  onPageChange={(p) => patchParams({ page: String(p) }, { resetPage: false })}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <SermonDetailModal
        slug={modalSlug}
        open={Boolean(modalSlug)}
        onOpenChange={closeModal}
        preview={preview}
      />
    </div>
  );
};

export default Sermons;
