import { Calendar, Radio, VideoOff } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LivePlayerEmbed from "@/components/live/LivePlayerEmbed";
import LiveServiceInfo from "@/components/live/LiveServiceInfo";
import { resolveLiveEmbed } from "@/components/live/liveMedia";
import { formatInLagos } from "@/lib/liveTimezone";
import type { Livestream } from "@/services/livestream.service";
import type { LivePageState } from "@/components/live/LiveIntro";
import { site } from "@/config/site";

type LivePlayerStageProps = {
  state: LivePageState;
  stream: Livestream | null;
  nextUpcoming?: Livestream | null;
  shareUrl: string;
  onRetry?: () => void;
};

const LivePlayerStage = ({
  state,
  stream,
  nextUpcoming,
  shareUrl,
  onRetry,
}: LivePlayerStageProps) => {
  if (state === "loading") {
    return (
      <div id="live-player" className="space-y-4" aria-busy="true" aria-label="Loading livestream">
        <Skeleton className="aspect-video w-full rounded-none" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        id="live-player"
        className="flex aspect-video flex-col items-center justify-center gap-4 bg-church-brown px-6 text-center text-white"
        role="alert"
      >
        <VideoOff className="h-12 w-12 text-church-gold-soft" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-2xl font-semibold">Something went wrong</h2>
          <p className="mt-2 max-w-md text-sm text-white/80">
            We could not load livestream information. Please try again in a moment.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button type="button" variant="church" className="rounded-full" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10">
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
              Parish YouTube
            </a>
          </Button>
        </div>
      </div>
    );
  }

  if (state === "live" && stream) {
    const source = resolveLiveEmbed(stream, { preferRecording: false });
    return (
      <div id="live-player" className="space-y-6">
        <LivePlayerEmbed source={source} isLive />
        <LiveServiceInfo stream={stream} shareUrl={shareUrl} mode="live" />
      </div>
    );
  }

  if (state === "ended" && stream) {
    const hasRecording = Boolean(stream.recorded_url);
    const source = resolveLiveEmbed(stream, { preferRecording: true });
    return (
      <div id="live-player" className="space-y-6">
        {hasRecording ? (
          <LivePlayerEmbed source={source} />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-church-charcoal px-6 text-center text-white">
            <Radio className="h-10 w-10 text-church-gold-soft" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-semibold">This broadcast has ended</h2>
            <p className="max-w-md text-sm text-white/80">
              A recording is not available yet. When it is published, it will appear here and in Recent
              Celebrations. We do not promise a specific publication time.
            </p>
            {nextUpcoming && (
              <p className="text-sm text-church-gold-soft">
                Next: {nextUpcoming.title}
                {nextUpcoming.scheduled_start_time
                  ? ` · ${formatInLagos(nextUpcoming.scheduled_start_time)}`
                  : ""}
              </p>
            )}
          </div>
        )}
        <LiveServiceInfo
          stream={stream}
          shareUrl={shareUrl}
          mode={hasRecording ? "recording" : "ended"}
        />
      </div>
    );
  }

  if (state === "upcoming" && (stream || nextUpcoming)) {
    const upcoming = stream ?? nextUpcoming!;
    const poster = upcoming.thumbnail_url;
    return (
      <div id="live-player" className="space-y-6">
        <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden bg-church-brown px-6 text-center text-white">
          {poster && (
            <>
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-church-brown/75" aria-hidden="true" />
            </>
          )}
          <div className="relative z-10 max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-soft">
              Coming up
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">{upcoming.title}</h2>
            {upcoming.scheduled_start_time && (
              <p className="mt-3 text-base text-white/90">
                {formatInLagos(upcoming.scheduled_start_time)}
              </p>
            )}
            <p className="mt-4 text-sm text-white/75">
              The player will be available when parish staff start the live broadcast. Add this
              service to your calendar so you do not miss it.
            </p>
          </div>
        </div>
        <LiveServiceInfo stream={upcoming} shareUrl={shareUrl} mode="upcoming" />
      </div>
    );
  }

  // Offline
  return (
    <div id="live-player" className="space-y-6">
      <div className="flex aspect-video flex-col items-center justify-center gap-4 bg-[#2a1a12] px-6 text-center text-white">
        <Calendar className="h-12 w-12 text-church-gold-soft" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-2xl font-semibold sm:text-3xl">We are not streaming right now</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/80">
            Thank you for visiting. When the next Mass or parish celebration goes live, it will appear
            here. Meanwhile you can browse recent celebrations or plan a visit in person.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild variant="church" className="rounded-full">
            <a href="#recent-celebrations">Recent celebrations</a>
          </Button>
          <Button asChild variant="outline" className="rounded-full border-white/35 bg-transparent text-white hover:bg-white/10">
            <Link to="/visit">Mass times &amp; visit</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-church-gold-soft hover:bg-white/10 hover:text-white">
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
              YouTube channel
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LivePlayerStage;
