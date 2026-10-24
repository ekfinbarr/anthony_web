import { useId, useState } from "react";
import { AlertCircle, ExternalLink, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LiveEmbedSource } from "@/components/live/liveMedia";

type LivePlayerEmbedProps = {
  source: LiveEmbedSource;
  isLive?: boolean;
  className?: string;
};

const LivePlayerEmbed = ({ source, isLive = false, className }: LivePlayerEmbedProps) => {
  const labelId = useId();
  const [started, setStarted] = useState(false);
  const [errored, setErrored] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = () => {
    setErrored(false);
    setStarted(true);
    setRetryKey((k) => k + 1);
  };

  if (source.kind === "none" || (!source.src && !source.html)) {
    return (
      <div
        className={`flex aspect-video flex-col items-center justify-center gap-4 bg-church-brown/95 px-6 text-center text-white ${className ?? ""}`}
        role="status"
      >
        <AlertCircle className="h-10 w-10 text-church-gold-soft" aria-hidden="true" />
        <div>
          <p className="font-serif text-xl font-semibold">Stream unavailable</p>
          <p className="mt-2 max-w-md text-sm text-white/80">
            We could not load an embed for this broadcast. You can try watching on the provider&apos;s
            site if a link is available.
          </p>
        </div>
        {source.externalUrl && (
          <Button asChild variant="church" size="sm" className="rounded-full">
            <a href={source.externalUrl} target="_blank" rel="noopener noreferrer">
              Open on provider
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>
    );
  }

  if (errored) {
    return (
      <div
        className={`flex aspect-video flex-col items-center justify-center gap-4 bg-church-charcoal px-6 text-center text-white ${className ?? ""}`}
        role="alert"
      >
        <AlertCircle className="h-10 w-10 text-church-gold-soft" aria-hidden="true" />
        <div>
          <p className="font-serif text-xl font-semibold">Playback problem</p>
          <p className="mt-2 max-w-md text-sm text-white/80">
            The player could not start. Check your connection, then try again. You can also open the
            broadcast on the provider&apos;s platform.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="church" size="sm" className="rounded-full" onClick={retry}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Retry player
          </Button>
          {source.externalUrl && (
            <Button asChild variant="outline" size="sm" className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10">
              <a href={source.externalUrl} target="_blank" rel="noopener noreferrer">
                Watch externally
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const showPoster = !started && Boolean(source.poster);

  return (
    <div className={`relative aspect-video overflow-hidden bg-black ${className ?? ""}`}>
      {isLive && (
        <div
          className="absolute left-3 top-3 z-20 inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow"
          aria-live="polite"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Live
        </div>
      )}

      {showPoster ? (
        <button
          type="button"
          className="group absolute inset-0 z-10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold-warm focus-visible:ring-offset-2"
          onClick={() => setStarted(true)}
          aria-labelledby={labelId}
        >
          {source.poster && (
            <img
              src={source.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          )}
          <span className="absolute inset-0 bg-black/45" aria-hidden="true" />
          <span
            id={labelId}
            className="relative inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-church-brown shadow-lg transition group-hover:bg-church-gold-soft"
          >
            <Play className="h-5 w-5 fill-current" aria-hidden="true" />
            Play {isLive ? "live stream" : "recording"}
          </span>
        </button>
      ) : null}

      {started || !source.poster ? (
        source.kind === "html" && source.html ? (
          <div
            key={retryKey}
            className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full"
            dangerouslySetInnerHTML={{ __html: source.html }}
            onError={() => setErrored(true)}
          />
        ) : (
          <iframe
            key={retryKey}
            src={source.src}
            title={source.title || "Livestream player"}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setErrored(true)}
          />
        )
      ) : null}
    </div>
  );
};

export default LivePlayerEmbed;
