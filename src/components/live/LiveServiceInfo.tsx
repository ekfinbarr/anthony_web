import { CalendarPlus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsShare from "@/components/news/NewsShare";
import type { Livestream } from "@/services/livestream.service";
import { formatInLagos } from "@/lib/liveTimezone";
import {
  buildLivestreamGoogleCalendarUrl,
  downloadLivestreamIcs,
  livestreamExternalUrl,
} from "@/components/live/liveMedia";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type LiveServiceInfoProps = {
  stream: Livestream;
  shareUrl: string;
  mode: "live" | "upcoming" | "ended" | "recording";
};

const LiveServiceInfo = ({ stream, shareUrl, mode }: LiveServiceInfoProps) => {
  const when =
    formatInLagos(stream.actual_start_time || stream.scheduled_start_time) ||
    formatInLagos(stream.end_time);
  const calendarUrl = buildLivestreamGoogleCalendarUrl(stream);
  const external = livestreamExternalUrl(stream);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-church-gold-warm">
          {mode === "live"
            ? "Now streaming"
            : mode === "upcoming"
              ? "Upcoming"
              : mode === "recording"
                ? "Recording"
                : "Broadcast ended"}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-church-charcoal sm:text-3xl">
          {stream.title}
        </h2>
        {when && (
          <p className="mt-2 text-sm text-church-charcoal/70 sm:text-base">{when}</p>
        )}
      </div>

      {stream.description && (
        <p className="text-base leading-relaxed text-church-charcoal/80">{stream.description}</p>
      )}

      {mode === "live" && (
        <p className="text-sm italic text-church-charcoal/70">
          You are welcome to pray with us. If you can, join standing or seated with reverence as you
          would in church.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <NewsShare title={stream.title} url={shareUrl} />
        {mode === "upcoming" && (
          <>
            {calendarUrl && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                  Google Calendar
                </a>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => downloadLivestreamIcs(stream)}
            >
              <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Download .ics
            </Button>
          </>
        )}
        {external && (
          <Button asChild variant="ghost" size="sm" className="text-church-gold-warm">
            <a href={external} target="_blank" rel="noopener noreferrer">
              Open on {stream.platform === "facebook" ? "Facebook" : "YouTube"}
            </a>
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible className="rounded-lg border border-church-stone/30 bg-white/70 px-3">
        <AccordionItem value="help" className="border-0">
          <AccordionTrigger className="py-3 text-sm hover:no-underline">
            <span className="inline-flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-church-gold-warm" aria-hidden="true" />
              Having trouble watching?
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-sm text-church-charcoal/75">
            <ol className="list-decimal space-y-2 pl-4">
              <li>Confirm your internet connection is stable.</li>
              <li>Try the Retry button on the player, or refresh this page once.</li>
              <li>Use “Open on YouTube/Facebook” if the embed is blocked by your browser or network.</li>
              <li>On mobile, try switching between Wi‑Fi and mobile data.</li>
            </ol>
            <p className="mt-3 text-xs text-church-charcoal/60">
              Live status is set by parish staff. If the Mass has started but this page does not show
              LIVE, please check again shortly or use the parish YouTube channel.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LiveServiceInfo;
