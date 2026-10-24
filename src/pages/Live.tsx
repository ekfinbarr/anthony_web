import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import LiveIntro, { type LivePageState } from "@/components/live/LiveIntro";
import LivePlayerStage from "@/components/live/LivePlayerStage";
import UpcomingBroadcasts from "@/components/live/UpcomingBroadcasts";
import RecentCelebrations from "@/components/live/RecentCelebrations";
import livestreamService, { type Livestream } from "@/services/livestream.service";
import { site } from "@/config/site";
import churchBanner from "@/assets/images/st_anthony.webp";

const PAST_PAGE_SIZE = 9;

const Live = () => {
  const { id } = useParams<{ id?: string }>();
  const reduceMotion = useReducedMotion();
  const [pastPage, setPastPage] = useState(1);
  const [pastAccumulated, setPastAccumulated] = useState<Livestream[]>([]);

  const currentQuery = useQuery({
    queryKey: ["livestreams", "current"],
    queryFn: () => livestreamService.getCurrent(),
    staleTime: 30_000,
    refetchInterval: (query) => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
      return query.state.data?.status === "live" ? 60_000 : 120_000;
    },
  });

  const upcomingQuery = useQuery({
    queryKey: ["livestreams", "upcoming"],
    queryFn: () => livestreamService.getUpcoming({ per_page: 8 }),
    staleTime: 60_000,
  });

  const detailQuery = useQuery({
    queryKey: ["livestream", id],
    queryFn: () => livestreamService.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
    retry: false,
  });

  const pastQuery = useQuery({
    queryKey: ["livestreams", "past", pastPage],
    queryFn: async () => {
      const res = await livestreamService.getPast({
        page: pastPage,
        per_page: PAST_PAGE_SIZE,
        recordings_only: true,
      });
      setPastAccumulated((prev) => {
        if (pastPage === 1) return res.data;
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.filter((p) => !seen.has(p.id))];
      });
      return res;
    },
    staleTime: 60_000,
  });

  const upcoming = upcomingQuery.data?.data ?? [];
  const nextUpcoming = upcoming[0] ?? null;
  const current = currentQuery.data ?? null;
  const detail = detailQuery.data ?? null;

  const { state, primaryStream, sharePath } = useMemo(() => {
    const loading =
      currentQuery.isLoading ||
      upcomingQuery.isLoading ||
      (Boolean(id) && detailQuery.isLoading);

    if (currentQuery.isError && upcomingQuery.isError && (!id || detailQuery.isError)) {
      return { state: "error" as LivePageState, primaryStream: null, sharePath: "/live" };
    }

    if (loading) {
      return { state: "loading" as LivePageState, primaryStream: null, sharePath: "/live" };
    }

    // Explicit LIVE from API only
    if (current && current.status === "live" && current.is_live) {
      // If viewing a different recording id while something is live, still prioritize live on hub;
      // on detail of another stream, show that stream if ended with recording
      if (id && detail && detail.id !== current.id) {
        if (detail.status === "ended" || detail.recorded_url) {
          return {
            state: "ended" as LivePageState,
            primaryStream: detail,
            sharePath: `/live/${detail.id}`,
          };
        }
        if (detail.status === "scheduled") {
          return {
            state: "upcoming" as LivePageState,
            primaryStream: detail,
            sharePath: `/live/${detail.id}`,
          };
        }
      }
      return {
        state: "live" as LivePageState,
        primaryStream: current,
        sharePath: `/live/${current.id}`,
      };
    }

    if (id && detail) {
      if (detail.status === "live" && detail.is_live) {
        return {
          state: "live" as LivePageState,
          primaryStream: detail,
          sharePath: `/live/${detail.id}`,
        };
      }
      if (detail.status === "ended" || detail.recorded_url) {
        return {
          state: "ended" as LivePageState,
          primaryStream: detail,
          sharePath: `/live/${detail.id}`,
        };
      }
      if (detail.status === "scheduled") {
        return {
          state: "upcoming" as LivePageState,
          primaryStream: detail,
          sharePath: `/live/${detail.id}`,
        };
      }
      if (detail.status === "cancelled" || detail.status === "unavailable") {
        return {
          state: "offline" as LivePageState,
          primaryStream: detail,
          sharePath: `/live/${detail.id}`,
        };
      }
    }

    if (id && detailQuery.isError) {
      // Unknown id — fall through to hub state
    }

    if (nextUpcoming) {
      return {
        state: "upcoming" as LivePageState,
        primaryStream: nextUpcoming,
        sharePath: `/live/${nextUpcoming.id}`,
      };
    }

    return { state: "offline" as LivePageState, primaryStream: null, sharePath: "/live" };
  }, [
    current,
    currentQuery.isError,
    currentQuery.isLoading,
    detail,
    detailQuery.isError,
    detailQuery.isLoading,
    id,
    nextUpcoming,
    upcomingQuery.isError,
    upcomingQuery.isLoading,
  ]);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${sharePath}`
      : `${site.url}${sharePath}`;

  const seoTitle =
    state === "live" && primaryStream
      ? `Live: ${primaryStream.title}`
      : state === "ended" && primaryStream
        ? primaryStream.title
        : "Live Mass & Worship";

  const seoDescription =
    primaryStream?.description ||
    "Join St. Anthony Catholic Church, Gbaja for live Mass and worship online. Watch livestreams and recent celebrations.";

  const fade = reduceMotion
    ? undefined
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  const retryAll = () => {
    void currentQuery.refetch();
    void upcomingQuery.refetch();
    void pastQuery.refetch();
    if (id) void detailQuery.refetch();
  };

  const pastItems = pastAccumulated.length ? pastAccumulated : pastQuery.data?.data ?? [];
  const pastHasMore = (pastQuery.data?.current_page ?? 1) < (pastQuery.data?.last_page ?? 1);

  return (
    <div className="bg-[#faf7f2]">
      <SEOHead title={seoTitle} description={seoDescription} path={sharePath} />

      <PageHeader
        size="compact"
        title="Live Stream"
        description="Mass and celebrations from St. Anthony Catholic Church, Gbaja"
        image={{ src: churchBanner, alt: "" }}
        breadcrumbs="auto"
      />

      <section className="border-b border-church-stone/20 bg-[#faf7f2] py-10 sm:py-12">
        <div className="container mx-auto px-4">
          <motion.div {...(fade ?? {})} transition={{ duration: 0.45 }}>
            <LiveIntro state={state} current={current} />
          </motion.div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] lg:gap-10">
            <motion.div
              {...(fade ?? {})}
              transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.05 }}
            >
              <LivePlayerStage
                state={state}
                stream={primaryStream}
                nextUpcoming={nextUpcoming}
                shareUrl={shareUrl}
                onRetry={retryAll}
              />
            </motion.div>

            <aside className="space-y-10 lg:pt-1">
              <UpcomingBroadcasts
                items={upcoming}
                isLoading={upcomingQuery.isLoading}
              />

              <div className="border border-church-stone/25 bg-church-brown px-5 py-6 text-white">
                <h2 className="font-serif text-xl font-semibold">Worship with us in person</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/85">
                  Online streams are a gift when you cannot attend. Whenever you can, we would love to
                  welcome you at St. Anthony, Gbaja.
                </p>
                <Link
                  to="/visit"
                  className="mt-4 inline-flex text-sm font-semibold text-church-gold-soft underline-offset-4 hover:underline"
                >
                  Plan your visit
                </Link>
              </div>
            </aside>
          </div>

          <div className="mx-auto mt-16 max-w-6xl border-t border-church-stone/25 pt-14">
            <RecentCelebrations
              items={pastItems}
              isLoading={pastQuery.isLoading && pastPage === 1}
              hasMore={pastHasMore}
              loadingMore={pastQuery.isFetching && pastPage > 1}
              onLoadMore={() => setPastPage((p) => p + 1)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Live;
