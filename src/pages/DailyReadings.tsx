import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { addDays, format, isValid, parseISO } from "date-fns";
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ReadingBody from "@/components/liturgy/ReadingBody";
import TextSizeControl, { useTextScale } from "@/components/liturgy/TextSizeControl";
import { liturgicalColour, seasonLabel } from "@/components/liturgy/liturgicalColour";
import dailyReadingService from "@/services/dailyReading.service";
import { notify } from "@/lib/notify";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Today in Lagos, regardless of the visitor's device timezone. */
function lagosToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
}

const DailyReadings = () => {
  const [params, setParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const textScale = useTextScale();

  const today = lagosToday();
  const requested = params.get("date");
  const date = requested && DATE_PATTERN.test(requested) && isValid(parseISO(requested)) ? requested : today;
  const isToday = date === today;
  // Readings are published six days ahead; earlier days come from the parish archive.
  const lastDate = format(addDays(parseISO(today), 6), "yyyy-MM-dd");
  const atLastDate = date >= lastDate;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["daily-readings", date],
    queryFn: () => (isToday ? dailyReadingService.getToday() : dailyReadingService.getByDate(date)),
    staleTime: 15 * 60_000,
    retry: 1,
  });

  const payload = data?.payload;
  const colour = liturgicalColour(payload?.colour);
  const season = seasonLabel(payload?.season, payload?.season_week);
  const dateLabel = format(parseISO(date), "EEEE, d MMMM yyyy");

  const goTo = (next: string) => {
    setParams(next === today ? {} : { date: next }, { preventScrollReset: true });
  };
  const shift = (days: number) => goTo(format(addDays(parseISO(date), days), "yyyy-MM-dd"));

  const share = async () => {
    const url = `${window.location.origin}/daily-readings${isToday ? "" : `?date=${date}`}`;
    const title = `Mass readings — ${dateLabel}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        notify.success("Link copied");
      }
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  };

  const fade = useMemo(
    () =>
      reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { duration: 0.3, ease: "easeOut" as const },
          },
    [reduceMotion],
  );

  return (
    <div className="min-h-screen bg-church-pearl">
      <PageHeader
        eyebrow={isToday ? "Today's Mass" : "Mass Readings"}
        title="Daily Readings"
        description={dateLabel}
        size="compact"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => shift(-1)}
            aria-label="Previous day"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <label className="relative inline-flex items-center">
            <span className="sr-only">Choose a date</span>
            <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-church-gold" aria-hidden="true" />
            <input
              type="date"
              value={date}
              max={lastDate}
              onChange={(e) => e.target.value && goTo(e.target.value)}
              className="h-10 rounded-full border border-white/30 bg-white/10 pl-9 pr-3 text-sm text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-church-gold"
            />
          </label>
          <Button
            variant="outline"
            size="icon"
            onClick={() => shift(1)}
            disabled={atLastDate}
            aria-label="Next day"
            className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {!isToday && (
            <Button variant="church" size="sm" onClick={() => goTo(today)} className="rounded-full">
              Today
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={date} {...fade}>
            {isLoading ? (
              <div className="space-y-6" aria-busy="true">
                <Skeleton className="h-36 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-full" />
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                ))}
              </div>
            ) : isError || !payload ? (
              <div className="rounded-2xl border border-church-charcoal/10 bg-white p-8 text-center shadow-sm">
                <h2 className="font-serif text-2xl font-bold text-church-charcoal">Readings unavailable</h2>
                <p className="mx-auto mt-3 max-w-md text-church-charcoal/70">
                  {date > lastDate
                    ? `Readings are published up to a week ahead — check back nearer to ${dateLabel}.`
                    : date < today
                      ? `The readings for ${dateLabel} aren't in our archive.`
                      : `We couldn't load the readings for ${dateLabel}. Please try again in a moment.`}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {date === today && (
                    <Button variant="church" onClick={() => refetch()} className="rounded-full">
                      Try again
                    </Button>
                  )}
                  {!isToday && (
                    <Button variant="outline" onClick={() => goTo(today)} className="rounded-full">
                      Go to today
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Celebration of the day */}
                <section
                  className="relative overflow-hidden rounded-2xl border border-church-charcoal/10 bg-white p-6 shadow-sm sm:p-8"
                  aria-labelledby="celebration-heading"
                >
                  <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: colour.value }} aria-hidden="true" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">
                    {payload.celebration.type === "saint" ? "Saint of the day" : "Celebration of the day"}
                  </p>
                  <h2
                    id="celebration-heading"
                    className="mt-2 text-balance font-serif text-3xl font-bold leading-tight text-church-charcoal sm:text-4xl"
                  >
                    {payload.celebration.title}
                  </h2>
                  {payload.celebration.subtitle && (
                    <p className="mt-2 text-church-charcoal/65">{payload.celebration.subtitle}</p>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                    {payload.celebration.rank && (
                      <span className="rounded-full bg-church-charcoal px-3 py-1 uppercase tracking-wide text-church-gold-soft">
                        {payload.celebration.rank}
                      </span>
                    )}
                    {season && <span className="rounded-full bg-church-stone px-3 py-1 text-church-charcoal/70">{season}</span>}
                    {colour.label && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-church-stone px-3 py-1 text-church-charcoal/70">
                        <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: colour.value }} />
                        Liturgical colour: {colour.label}
                      </span>
                    )}
                  </div>
                </section>

                {/* Jump bar */}
                <nav
                  aria-label="Readings"
                  className="sticky top-20 z-30 -mx-4 mt-8 border-y border-church-charcoal/10 bg-church-pearl/95 px-4 py-2.5 backdrop-blur sm:mx-0 sm:rounded-full sm:border sm:px-2"
                >
                  <div className="flex items-center gap-2">
                    <ul className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
                      {payload.readings.map((r) => (
                        <li key={r.key} className="shrink-0">
                          <a
                            href={`#${r.key}`}
                            className="block rounded-full px-3.5 py-1.5 text-sm font-medium text-church-charcoal/75 transition-colors hover:bg-church-gold/20 hover:text-church-charcoal"
                          >
                            {r.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                    <TextSizeControl {...textScale} className="hidden shrink-0 sm:inline-flex" />
                    <Button variant="ghost" size="icon" onClick={share} aria-label="Share readings" className="shrink-0 rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </nav>
                <div className="mt-4 flex justify-end sm:hidden">
                  <TextSizeControl {...textScale} />
                </div>

                {/* Readings */}
                <div className="mt-6 space-y-6" style={{ fontSize: `${textScale.scale}rem` }}>
                  {payload.readings.map((r, i) => (
                    <motion.article
                      key={r.key}
                      id={r.key}
                      className="scroll-mt-40 rounded-2xl border border-church-charcoal/10 bg-white p-6 shadow-sm sm:p-8"
                      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: Math.min(i, 2) * 0.05 }}
                    >
                      <header className="mb-4 border-b border-church-charcoal/10 pb-4">
                        <p className="text-[0.75em] font-semibold uppercase tracking-[0.18em]" style={{ color: colour.value }}>
                          {r.label}
                        </p>
                        {r.source && (
                          <p className="mt-1 font-heading text-[1.15em] font-bold text-church-charcoal">{r.source}</p>
                        )}
                        {r.heading && <p className="mt-2 font-serif text-[1.05em] italic text-church-brown">{r.heading}</p>}
                      </header>
                      {r.html ? (
                        <ReadingBody html={r.html} className={r.key === "psalm" ? "reading-body--psalm" : undefined} />
                      ) : (
                        <p className="font-serif italic text-church-charcoal/60">
                          The text of this {r.key === "psalm" ? "psalm" : "reading"} isn't available here today — please
                          read {r.source ?? "it"} in your Bible or missal.
                        </p>
                      )}
                    </motion.article>
                  ))}
                </div>

                {/* Next steps + attribution */}
                <div className="mt-10 flex flex-col items-center gap-4 text-center">
                  <Button asChild variant="church" size="lg" className="rounded-full px-7">
                    <Link to="/order-of-mass">
                      <BookOpen className="mr-1 h-4 w-4" aria-hidden="true" />
                      Follow the Order of Mass
                    </Link>
                  </Button>
                  {payload.copyright && (
                    <p className="max-w-3xl text-xs leading-relaxed text-church-charcoal/55">
                      {payload.copyright}{" "}
                      <a
                        href={payload.attribution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:text-church-charcoal"
                      >
                        universalis.com
                      </a>
                    </p>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DailyReadings;
