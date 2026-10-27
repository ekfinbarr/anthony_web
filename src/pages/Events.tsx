import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import EventCard from "@/components/events/EventCard";
import EventsFeatured from "@/components/events/EventsFeatured";
import EventsComingUp from "@/components/events/EventsComingUp";
import EventsFilters from "@/components/events/EventsFilters";
import EventsToolbar from "@/components/events/EventsToolbar";
import EventCalendar from "@/components/events/calendar/EventCalendar";
import { isoDay, visibleRange, type CalendarView } from "@/components/events/calendar/calendarModel";
import EventsPastArchive from "@/components/events/EventsPastArchive";
import EventsPagination from "@/components/events/EventsPagination";
import EventsEmptyState from "@/components/events/EventsEmptyState";
import eventService from "@/services/event.service";
import categoryService from "@/services/category.service";
import { eventHref, relativeDateLabel } from "@/lib/events";
import bannerPhoto from "@/assets/images/st_anthony.webp";

const PER_PAGE = 12;

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const qParam = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const timeframe = (searchParams.get("timeframe") || "upcoming") as "upcoming" | "past";
  const sort = searchParams.get("sort") || "soonest";
  const view = (searchParams.get("view") || "list") as "list" | "calendar";
  const dateParam = searchParams.get("date") || "";
  const yearParam = searchParams.get("year") || "";

  const [searchInput, setSearchInput] = useState(() => qParam);
  const calParam = searchParams.get("cal") as CalendarView | null;
  const calView: CalendarView = calParam && ["month", "week", "day", "agenda"].includes(calParam) ? calParam : "month";
  const [calDate, setCalDate] = useState(() => new Date());
  const calRange = visibleRange(calView, calDate);
  const calFrom = isoDay(calRange.start);
  const calTo = isoDay(calRange.end);

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

  const hasActiveFilters = Boolean(qParam || category || dateParam || yearParam || sort !== "soonest" || timeframe !== "upcoming");
  const showFeatured = !hasActiveFilters && page === 1 && view === "list" && timeframe === "upcoming";

  const categoriesQuery = useQuery({
    queryKey: ["event-categories"],
    queryFn: async () => {
      const res = await categoryService.list({ active: true });
      const all = res.data || [];
      // Prefer children of "events" parent; fall back to event-like slugs
      const eventChildren = all.filter((c) => {
        const parent = all.find((p) => p.id === c.parent_id);
        return parent?.slug === "events";
      });
      if (eventChildren.length) return eventChildren;
      return all.filter((c) =>
        /liturgical|spiritual|sacrament|parish-community|choir|youth|charity|workshop|other-parish|events/i.test(
          c.slug,
        ),
      );
    },
    staleTime: 5 * 60 * 1000,
  });

  const featuredQuery = useQuery({
    queryKey: ["events", "featured"],
    queryFn: () => eventService.getFeatured(),
    enabled: showFeatured,
    staleTime: 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: ["events", "public", page, qParam, category, timeframe, sort, dateParam, yearParam],
    queryFn: () =>
      eventService.getPublic({
        page,
        per_page: PER_PAGE,
        search: qParam || undefined,
        category: category || undefined,
        timeframe,
        sort,
        date: dateParam || undefined,
        year: yearParam || undefined,
      }),
    enabled: view === "list",
    staleTime: 60 * 1000,
  });

  const calendarQuery = useQuery({
    queryKey: ["events", "calendar", calFrom, calTo],
    queryFn: () => eventService.getCalendar({ from: calFrom, to: calTo }),
    enabled: view === "calendar",
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  // The calendar endpoint has no filters; apply the page's category and search here.
  const calendarEvents = useMemo(() => {
    const q = qParam.trim().toLowerCase();
    return (calendarQuery.data ?? []).filter(
      (event) =>
        (!category || (event.categories ?? []).some((c) => c.slug === category)) &&
        (!q || `${event.name} ${event.summary ?? ""} ${event.location ?? ""}`.toLowerCase().includes(q))
    );
  }, [calendarQuery.data, category, qParam]);

  const pastPreviewQuery = useQuery({
    queryKey: ["events", "past-preview", yearParam],
    queryFn: () =>
      eventService.getPublic({
        timeframe: "past",
        per_page: 6,
        sort: "latest",
        year: yearParam || undefined,
      }),
    enabled: view === "list" && timeframe === "upcoming" && !hasActiveFilters && page === 1,
    staleTime: 60 * 1000,
  });

  const events = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const featured = featuredQuery.data;
  const comingUp = useMemo(() => {
    const source = events.filter((e) => e.id !== featured?.id).slice(0, 4);
    return source;
  }, [events, featured?.id]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof events> = {};
    events.forEach((event) => {
      if (featured && event.id === featured.id && showFeatured) return;
      const label = timeframe === "past" ? "Past" : relativeDateLabel(event) || "Upcoming";
      if (!groups[label]) groups[label] = [];
      groups[label].push(event);
    });
    return groups;
  }, [events, featured, showFeatured, timeframe]);

  const pastYears = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2, y - 3];
  }, []);

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <SEOHead
        title="Events & Celebrations"
        description="Discover upcoming celebrations, spiritual gatherings, and community activities at St. Anthony Catholic Church, Gbaja. Find an event, mark your calendar, and join us."
        path="/events"
      />

      <PageHeader
        eyebrow="Life at St. Anthony"
        title="Gather, Celebrate & Grow in Faith"
        description="Discover upcoming celebrations, spiritual gatherings, and community activities at St. Anthony Catholic Church, Gbaja. Find an event, mark your calendar, and join us."
        image={{ src: bannerPhoto, alt: "St. Anthony Catholic Church, Gbaja" }}
        tone="dark"
        size="compact"
      />

      <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mb-8 space-y-5">
          <EventsFilters
            categories={(categoriesQuery.data || []).map((c) => ({ slug: c.slug, label: c.label }))}
            value={category || "all"}
            onChange={(slug) => updateParams({ category: slug || null })}
          />
          <EventsToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            sort={sort}
            onSortChange={(v) => updateParams({ sort: v })}
            timeframe={timeframe}
            onTimeframeChange={(v) => updateParams({ timeframe: v, year: v === "past" ? yearParam || null : null })}
            view={view}
            onViewChange={(v) => updateParams({ view: v === "list" ? null : v, date: null })}
          />
        </div>

        {view === "calendar" ? (
          <EventCalendar
            events={calendarEvents}
            loading={calendarQuery.isFetching}
            view={calView}
            date={calDate}
            onViewChange={(v) => updateParams({ cal: v === "month" ? null : v })}
            onDateChange={setCalDate}
            renderActions={(event) => (
              <Button asChild size="sm">
                <Link to={eventHref(event)}>View event details</Link>
              </Button>
            )}
          />
        ) : (
          <>
            {showFeatured && featuredQuery.isLoading && (
              <Skeleton className="mb-14 h-72 w-full" />
            )}
            {showFeatured && featured && <EventsFeatured event={featured} />}
            {showFeatured && !featured && !featuredQuery.isLoading && (
              <div className="mb-10 border border-church-gold-warm/20 bg-white px-6 py-8 text-center">
                <p className="font-serif text-lg text-church-charcoal">No upcoming events are scheduled yet.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Explore{" "}
                  <Link to="/calendar" className="text-church-gold-warm underline-offset-4 hover:underline">
                    the parish calendar
                  </Link>{" "}
                  or browse past celebrations below.
                </p>
              </div>
            )}

            {showFeatured && comingUp.length > 0 && <EventsComingUp events={comingUp} />}

            {listQuery.isLoading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-72 w-full" />
                ))}
              </div>
            )}

            {listQuery.isError && (
              <EventsEmptyState
                title="We couldn’t load events"
                description="Please try again in a moment. If the problem continues, contact the parish office."
              />
            )}

            {!listQuery.isLoading && !listQuery.isError && events.length === 0 && (
              <EventsEmptyState showClear={hasActiveFilters} onClear={clearFilters} />
            )}

            {!listQuery.isLoading && events.length > 0 && (
              <div className="space-y-12">
                {Object.entries(grouped).map(([label, items]) => (
                  <section key={label} aria-labelledby={`group-${label}`}>
                    <h2 id={`group-${label}`} className="mb-5 font-serif text-xl font-semibold text-church-charcoal">
                      {label}
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((event) => (
                        <EventCard key={event.id} event={event} past={timeframe === "past"} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            <EventsPagination
              page={listQuery.data?.current_page || page}
              lastPage={listQuery.data?.last_page || 1}
              total={listQuery.data?.total}
              onPageChange={(p) => updateParams({ page: String(p) }, false)}
            />

            {view === "list" && timeframe === "upcoming" && !hasActiveFilters && page === 1 && (
              <EventsPastArchive
                events={pastPreviewQuery.data?.data || []}
                year={yearParam}
                years={pastYears}
                onYearChange={(y) => updateParams({ timeframe: "past", year: y || null, sort: "latest" })}
              />
            )}
          </>
        )}

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Looking for Mass times and liturgical observances?{" "}
          <Link to="/calendar" className="font-medium text-church-gold-warm underline-offset-4 hover:underline">
            Open the parish calendar
          </Link>
          .
        </p>
      </div>
    </div>
  );
};

export default Events;
