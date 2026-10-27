import { Link } from "react-router-dom";
import type { Livestream } from "@/services/livestream.service";

type LivePageState = "loading" | "live" | "upcoming" | "ended" | "offline" | "error";

type LiveIntroProps = {
  state: LivePageState;
  current?: Livestream | null;
};

const statusCopy: Record<LivePageState, { label: string; tone: string }> = {
  loading: { label: "Checking stream…", tone: "bg-church-stone/20 text-church-charcoal" },
  live: { label: "Live now", tone: "bg-red-600 text-white" },
  upcoming: { label: "Next broadcast scheduled", tone: "bg-church-gold-warm/15 text-church-brown" },
  ended: { label: "Broadcast ended", tone: "bg-church-stone/25 text-church-charcoal" },
  offline: { label: "Not streaming right now", tone: "bg-church-stone/20 text-church-charcoal" },
  error: { label: "Unable to load stream info", tone: "bg-red-100 text-red-900" },
};

const LiveIntro = ({ state, current }: LiveIntroProps) => {
  const chip = statusCopy[state];

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-church-gold-warm">
        St. Anthony, Gbaja
      </p>
      {/* <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3.25rem)] font-bold leading-tight tracking-tight text-church-charcoal">
        Live Mass &amp; Worship
      </h1> */}
      {/* <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-church-charcoal/75 sm:text-lg">
        Join the parish family for Mass and celebrations from anywhere. Watch live when we are
        streaming, or revisit recent recordings below.
      </p> */}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${chip.tone}`}
          role="status"
        >
          {state === "live" && (
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
          )}
          {chip.label}
          {state === "live" && current?.title ? ` · ${current.title}` : null}
        </span>
      </div>

      <nav
        className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
        aria-label="On this page"
      >
        <a href="#live-player" className="text-church-gold-warm underline-offset-4 hover:underline">
          Watch
        </a>
        <a href="#upcoming-broadcasts" className="text-church-gold-warm underline-offset-4 hover:underline">
          Upcoming
        </a>
        <a href="#recent-celebrations" className="text-church-gold-warm underline-offset-4 hover:underline">
          Recent celebrations
        </a>
        <Link to="/visit" className="text-church-charcoal/70 underline-offset-4 hover:underline">
          Mass schedule
        </Link>
      </nav>
    </div>
  );
};

export default LiveIntro;
export type { LivePageState };
