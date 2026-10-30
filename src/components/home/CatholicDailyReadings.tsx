import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowRight, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Reveal from "@/components/parish-home/Reveal";
import { liturgicalColour, seasonLabel } from "@/components/liturgy/liturgicalColour";
import dailyReadingService from "@/services/dailyReading.service";

/**
 * Landing-page band: celebration of the day, liturgical colour and season,
 * a taste of the first reading, and links into the full readings.
 */
export default function CatholicDailyReadings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["daily-readings", "today"],
    queryFn: dailyReadingService.getToday,
    staleTime: 15 * 60_000,
    retry: 1,
  });

  const payload = data?.payload;
  const colour = liturgicalColour(payload?.colour);
  const first = payload?.readings.find((r) => r.key === "first_reading") ?? payload?.readings[0];
  const dateLabel = data ? format(parseISO(data.reading_date), "EEEE, d MMMM yyyy") : null;
  const season = seasonLabel(payload?.season, payload?.season_week);

  return (
    <section
      className="relative overflow-hidden bg-church-pearl py-14 sm:py-16 lg:py-20"
      aria-labelledby="daily-readings-heading"
    >
      {/* Liturgical colour of the day as a thin top rule */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-colors duration-700"
        style={{ backgroundColor: colour.value }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-church-gold/10 blur-3xl" aria-hidden="true" />

      <div className="container relative mx-auto grid gap-10 px-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
        <Reveal className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-church-gold-warm sm:text-xs">
              Daily Reading &amp; Reflection
            </p>
            <span className="h-px w-12 bg-church-gold-warm/70" aria-hidden="true" />
          </div>

          {isLoading ? (
            <div className="space-y-4" aria-busy="true">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-12 w-full max-w-lg" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError || !payload ? (
            <>
              <h2 id="daily-readings-heading" className="font-serif text-3xl font-bold text-church-charcoal sm:text-4xl">
                Today's Mass Readings
              </h2>
              <p className="mt-4 max-w-xl text-church-charcoal/70">
                Today's readings aren't available at the moment. Please check back shortly.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-church-charcoal/60">{dateLabel}</p>
              <h2
                id="daily-readings-heading"
                className="mt-2 text-balance font-serif text-[clamp(1.85rem,4.2vw,3rem)] font-bold leading-[1.08] tracking-tight text-church-charcoal"
              >
                {payload.celebration.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                {payload.celebration.rank && (
                  <span className="rounded-full bg-church-charcoal px-3 py-1 uppercase tracking-wide text-church-gold-soft">
                    {payload.celebration.rank}
                  </span>
                )}
                {payload.celebration.subtitle && (
                  <span className="rounded-full bg-church-stone px-3 py-1 text-church-charcoal/70">
                    {payload.celebration.subtitle}
                  </span>
                )}
                {season && (
                  <span className="rounded-full bg-church-stone px-3 py-1 text-church-charcoal/70">{season}</span>
                )}
                {colour.label && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-church-charcoal/10 bg-white px-3 py-1 text-church-charcoal/70">
                    <span className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: colour.value }} />
                    {colour.label}
                  </span>
                )}
              </div>

              {first && (
                <figure className="mt-7 border-l-2 pl-5" style={{ borderColor: colour.value }}>
                  <figcaption className="text-xs font-semibold uppercase tracking-[0.16em] text-church-charcoal/55">
                    {first.label}
                    {first.source && <span className="normal-case tracking-normal"> · {first.source}</span>}
                  </figcaption>
                  {first.heading && (
                    <blockquote className="mt-2 font-serif text-xl italic leading-snug text-church-brown sm:text-2xl">
                      “{first.heading}”
                    </blockquote>
                  )}
                  {first.excerpt && (
                    <p className="mt-3 line-clamp-3 text-base leading-relaxed text-church-charcoal/75">{first.excerpt}</p>
                  )}
                </figure>
              )}
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="church" size="lg" className="group rounded-full px-7">
              <Link to="/daily-readings">
                Continue with Daily Reading
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-church-charcoal/15 px-6">
              <Link to="/order-of-mass">
                <BookOpen className="mr-1 h-4 w-4" aria-hidden="true" />
                Order of Mass
              </Link>
            </Button>
          </div>
        </Reveal>

        {/* The day's readings at a glance */}
        <Reveal from="right" delay={120} className="min-w-0 self-center">
          <ol className="space-y-3">
            {(isLoading ? Array.from({ length: 4 }, () => null) : payload?.readings ?? []).map((reading, i) =>
              reading ? (
                <li key={reading.key} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                  <Link
                    to={`/daily-readings#${reading.key}`}
                    className="group flex items-center gap-4 rounded-xl border border-church-charcoal/10 bg-white px-4 py-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-church-gold/60 hover:shadow-card-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm font-bold text-white"
                      style={{ backgroundColor: colour.value }}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-church-charcoal/55">
                        {reading.label}
                      </span>
                      <span className="block truncate font-heading font-semibold text-church-charcoal">
                        {reading.source || reading.heading}
                      </span>
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-church-charcoal/40 transition-transform group-hover:translate-x-1 group-hover:text-church-gold-warm"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ) : (
                <li key={i}>
                  <Skeleton className="h-16 w-full rounded-xl" />
                </li>
              ),
            )}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
