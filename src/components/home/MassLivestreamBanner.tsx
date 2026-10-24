import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import monstrance from "@/assets/images/monstrance_full.png";
import churchInterior from "@/assets/images/golden_onstrance.png";
import Reveal from "@/components/parish-home/Reveal";
import livestreamService from "@/services/livestream.service";
import { formatLagosCompact } from "@/lib/liveTimezone";

const MassLivestreamBanner = () => {
  const { data: current } = useQuery({
    queryKey: ["livestreams", "current"],
    queryFn: () => livestreamService.getCurrent(),
    staleTime: 30_000,
    refetchInterval: (q) => (q.state.data?.status === "live" ? 60_000 : false),
  });

  const isLive = Boolean(current?.status === "live" && current?.is_live);

  return (
    <section
      className="relative overflow-hidden bg-church-brown text-white"
      aria-labelledby="mass-livestream-heading"
    >
      {/* Atmospheric church interior — muted under a brown overlay */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={churchInterior}
          alt=""
          className="h-full w-full object-cover object-center opacity-35"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, hsl(var(--church-brown) / 0.97) 0%, hsl(var(--church-brown) / 0.88) 42%, hsl(var(--church-brown) / 0.72) 70%, hsl(var(--church-brown) / 0.82) 100%)",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto grid items-center gap-10 px-4 pb-14 pt-10 sm:gap-12 sm:pb-16 sm:pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:gap-8 lg:pb-12 lg:pt-8">
        <Reveal className="mx-auto max-w-xl text-center lg:mx-0 lg:py-10 lg:text-left">
          <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-church-gold-soft sm:text-xs">
              Join us for our
            </p>
            <span className="hidden h-px w-12 bg-church-gold-warm/80 sm:block" aria-hidden="true" />
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
                Live
              </span>
            )}
          </div>

          <h2
            id="mass-livestream-heading"
            className="font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-bold leading-[0.95] tracking-tight text-white"
          >
            Mass
            <br className="hidden sm:block" />{" "}
            <span className="sm:inline">Livestream</span>
          </h2>

          <p className="mx-auto mt-5 flex max-w-lg flex-wrap items-start justify-center gap-2 text-base leading-snug text-white/90 sm:text-lg lg:mx-0 lg:justify-start">
            <Calendar
              className="mt-0.5 h-5 w-5 shrink-0 text-church-gold-soft"
              aria-hidden="true"
              strokeWidth={1.75}
            />
            <span>
              {isLive && current ? (
                <>
                  Live now: <span className="text-white">{current.title}</span>
                </>
              ) : (
                <>
                  Join us for Mass online
                  {current?.scheduled_start_time
                    ? ` · ${formatLagosCompact(current.scheduled_start_time)}`
                    : null}
                </>
              )}
            </span>
          </p>

          <Button
            asChild
            variant="church"
            size="lg"
            className="mt-8 rounded-full px-7 focus-visible:ring-offset-church-brown"
          >
            <Link to={isLive && current ? `/live/${current.id}` : "/live"}>
              {isLive ? "Watch live" : "Open livestream"}
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>

        <Reveal
          from="right"
          delay={100}
          className="flex justify-center lg:justify-end"
        >
          <img
            src={monstrance}
            alt=""
            width={780}
            height={940}
            loading="lazy"
            decoding="async"
            className="h-auto w-[min(100%,18rem)] object-contain object-bottom drop-shadow-xl sm:w-[min(100%,22rem)] lg:w-[min(100%,26rem)] lg:translate-y-4"
          />
        </Reveal>
      </div>
    </section>
  );
};

export default MassLivestreamBanner;
