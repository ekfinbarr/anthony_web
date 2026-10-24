import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import BulletinFeatured from "@/components/bulletins/BulletinFeatured";
import BulletinCard from "@/components/bulletins/BulletinCard";
import BulletinFilters from "@/components/bulletins/BulletinFilters";
import BulletinCalendarPanel from "@/components/bulletins/BulletinCalendarPanel";
import BulletinPagination from "@/components/bulletins/BulletinPagination";
import BulletinEmptyState from "@/components/bulletins/BulletinEmptyState";
import bulletinService from "@/services/bulletin.service";
import type { Bulletin as BulletinType } from "@/services/bulletin.service";
import { useToast } from "@/hooks/use-toast";

const PER_PAGE = 12;

const Bulletin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const qParam = searchParams.get("q") || "";
  const year = searchParams.get("year") || "";
  const month = searchParams.get("month") || "";
  const sort = (searchParams.get("sort") || "newest") as "newest" | "oldest";
  const dateParam = searchParams.get("date") || "";

  const [searchInput, setSearchInput] = useState(() => qParam);
  const [calendarOpen, setCalendarOpen] = useState(Boolean(dateParam));
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (dateParam) {
      try {
        return startOfMonth(parseISO(dateParam));
      } catch {
        /* fall through */
      }
    }
    if (year) {
      const m = month ? Number(month) - 1 : 0;
      return new Date(Number(year), m, 1);
    }
    return startOfMonth(new Date());
  });

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

  const hasActiveFilters = Boolean(qParam || year || month || dateParam || sort !== "newest");

  const latestQuery = useQuery({
    queryKey: ["bulletins-latest"],
    queryFn: () => bulletinService.latest(),
  });

  const metaQuery = useQuery({
    queryKey: ["bulletins-meta"],
    queryFn: () => bulletinService.meta(),
  });

  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthNum = calendarMonth.getMonth() + 1;

  const calendarQuery = useQuery({
    queryKey: ["bulletins-calendar", calendarYear, calendarMonthNum],
    queryFn: () =>
      bulletinService.calendar({ year: calendarYear, month: calendarMonthNum }),
    enabled: calendarOpen,
  });

  const listQuery = useQuery({
    queryKey: ["bulletins-list", page, qParam, year, month, sort, dateParam],
    queryFn: () =>
      bulletinService.list({
        page,
        per_page: PER_PAGE,
        search: qParam || undefined,
        year: year || undefined,
        month: month || undefined,
        sort,
        from_date: dateParam || undefined,
        to_date: dateParam || undefined,
        exclude_slug:
          !hasActiveFilters && page === 1 && latestQuery.data?.slug
            ? latestQuery.data.slug
            : undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const latest = latestQuery.data ?? null;
  const showFeatured = !hasActiveFilters && page === 1 && latest;
  const editions = listQuery.data?.data ?? [];
  const lastPage = listQuery.data?.last_page ?? 1;
  const total = listQuery.data?.total ?? 0;

  const handleDownload = useCallback(
    async (bulletin: BulletinType) => {
      try {
        const result = await bulletinService.trackDownload(bulletin.slug);
        const url = result.download_url || bulletin.file_url;
        if (!url) {
          toast({
            title: "Download unavailable",
            description: "This edition does not have a downloadable file.",
            variant: "destructive",
          });
          return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {
        if (bulletin.file_url) {
          window.open(bulletin.file_url, "_blank", "noopener,noreferrer");
        } else {
          toast({
            title: "Download failed",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
        }
      }
    },
    [toast],
  );

  const clearAll = useCallback(() => {
    setSearchInput("");
    setCalendarOpen(false);
    setSearchParams({});
  }, [setSearchParams]);

  const archiveHeading = useMemo(() => {
    if (dateParam) {
      try {
        return `Edition for ${format(parseISO(dateParam), "d MMMM yyyy")}`;
      } catch {
        return "Previous Editions";
      }
    }
    return "Previous Editions";
  }, [dateParam]);

  return (
    <div className="bg-church-pearl/40">
      <SEOHead
        title="Sunday Bulletins"
        description="Stay connected with our parish community. Explore the latest Sunday bulletin and browse previous editions for parish news, announcements, readings, celebrations, and upcoming activities."
        path="/bulletin"
      />

      <PageHeader
        size="compact"
        eyebrow="STAY INFORMED"
        title="Sunday Bulletins"
        description="Stay connected with our parish community. Explore the latest Sunday bulletin and browse previous editions for parish news, announcements, readings, celebrations, and upcoming activities."
      />

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          {latestQuery.isLoading && (
            <div className="mb-14 overflow-hidden rounded-xl border border-church-gold-warm/15 bg-white lg:grid lg:grid-cols-2">
              <Skeleton className="aspect-[4/5] w-full lg:min-h-[24rem]" />
              <div className="space-y-4 p-8">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-40" />
              </div>
            </div>
          )}

          {showFeatured && latest && (
            <BulletinFeatured bulletin={latest} onDownload={handleDownload} />
          )}

          {!latestQuery.isLoading && !latest && !hasActiveFilters && (
            <div className="mb-10">
              <BulletinEmptyState variant="empty" />
            </div>
          )}

          {(latest || hasActiveFilters || total > 0 || listQuery.isLoading) && (
            <>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-px max-w-[2.5rem] flex-1 bg-gradient-church" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">
                      Archive
                    </p>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold text-church-charcoal md:text-3xl">
                    {archiveHeading}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse past Sunday editions by date, keyword, or calendar.
                  </p>
                </div>
              </div>

              <BulletinFilters
                search={searchInput}
                year={year}
                month={month}
                sort={sort}
                meta={metaQuery.data}
                onSearchChange={setSearchInput}
                onClearSearch={() => {
                  setSearchInput("");
                  updateParams({ q: null });
                }}
                onYearChange={(v) => updateParams({ year: v || null, month: null, date: null })}
                onMonthChange={(v) => updateParams({ month: v || null, date: null })}
                onSortChange={(v) => updateParams({ sort: v === "newest" ? null : v })}
                onClearAll={clearAll}
                hasActiveFilters={hasActiveFilters}
              />

              <div className="mb-8">
                <BulletinCalendarPanel
                  open={calendarOpen}
                  onOpenChange={setCalendarOpen}
                  publishedDates={calendarQuery.data?.dates ?? []}
                  selectedDate={dateParam || null}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  onSelectDate={(iso) => {
                    if (!iso) {
                      updateParams({ date: null });
                      return;
                    }
                    updateParams({ date: iso, year: null, month: null, q: null });
                    setSearchInput("");
                    // Navigate to the edition for that date when unique
                    void bulletinService
                      .list({ from_date: iso, to_date: iso, per_page: 1 })
                      .then((res) => {
                        const hit = res.data[0];
                        if (hit?.slug) {
                          navigate(`/bulletin/${hit.slug}`);
                        }
                      })
                      .catch(() => {
                        /* stay on filtered list */
                      });
                  }}
                />
              </div>

              {listQuery.isLoading && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-xl border border-church-gold-warm/10 bg-white">
                      <Skeleton className="aspect-[3/4] w-full" />
                      <div className="space-y-2 p-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {listQuery.isError && (
                <div className="rounded-xl border border-destructive/20 bg-white p-8 text-center">
                  <p className="text-church-charcoal">We could not load the bulletin archive.</p>
                  <Button variant="church" className="mt-4" onClick={() => listQuery.refetch()}>
                    Try again
                  </Button>
                </div>
              )}

              {!listQuery.isLoading && !listQuery.isError && editions.length === 0 && (
                <BulletinEmptyState
                  variant={hasActiveFilters ? "no-results" : "empty"}
                  onClear={hasActiveFilters ? clearAll : undefined}
                />
              )}

              {!listQuery.isLoading && !listQuery.isError && editions.length > 0 && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {editions.map((bulletin) => (
                      <BulletinCard
                        key={bulletin.id}
                        bulletin={bulletin}
                        onDownload={handleDownload}
                      />
                    ))}
                  </div>

                  <div className="mt-10">
                    <BulletinPagination
                      page={page}
                      lastPage={lastPage}
                      total={total}
                      onPageChange={(p) =>
                        updateParams({ page: p <= 1 ? null : String(p) }, false)
                      }
                    />
                  </div>
                </>
              )}
            </>
          )}

          <aside className="mt-16 rounded-xl border border-church-gold-warm/15 bg-white p-8 text-center">
            <p className="font-serif text-lg text-church-charcoal">
              Looking for events or parish news?
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="border-church-gold-warm/30" asChild>
                <Link to="/news">Parish News</Link>
              </Button>
              <Button variant="outline" className="border-church-gold-warm/30" asChild>
                <Link to="/events">Events</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Bulletin;
