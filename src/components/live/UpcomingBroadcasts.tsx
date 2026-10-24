import { Link } from "react-router-dom";
import { CalendarPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Livestream } from "@/services/livestream.service";
import { formatLagosCompact } from "@/lib/liveTimezone";
import {
  buildLivestreamGoogleCalendarUrl,
  downloadLivestreamIcs,
  livestreamThumbnail,
} from "@/components/live/liveMedia";

type UpcomingBroadcastsProps = {
  items: Livestream[];
  isLoading?: boolean;
};

const UpcomingBroadcasts = ({ items, isLoading }: UpcomingBroadcastsProps) => {
  return (
    <section id="upcoming-broadcasts" className="scroll-mt-24" aria-labelledby="upcoming-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">
            Schedule
          </p>
          <h2 id="upcoming-heading" className="mt-1 font-serif text-2xl font-bold text-church-charcoal sm:text-3xl">
            Upcoming broadcasts
          </h2>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-church-stone/40 bg-white/50 px-5 py-8 text-center text-sm text-church-charcoal/70">
          No upcoming livestreams are scheduled yet. Check back soon, or see our{" "}
          <Link to="/visit" className="text-church-gold-warm underline-offset-2 hover:underline">
            Mass schedule
          </Link>
          .
        </p>
      )}

      {!isLoading && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((item) => {
            const thumb = livestreamThumbnail(item);
            const cal = buildLivestreamGoogleCalendarUrl(item);
            return (
              <li
                key={item.id}
                className="flex flex-col gap-4 border border-church-stone/25 bg-white/80 p-4 sm:flex-row sm:items-stretch"
              >
                <Link
                  to={`/live/${item.id}`}
                  className="relative aspect-video w-full shrink-0 overflow-hidden bg-church-stone/20 sm:aspect-auto sm:h-auto sm:w-40"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-full min-h-[5.5rem] items-center justify-center text-church-charcoal/40">
                      <Clock className="h-8 w-8" aria-hidden="true" />
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-church-gold-warm">
                      Scheduled
                    </p>
                    <Link
                      to={`/live/${item.id}`}
                      className="mt-1 block font-serif text-xl font-semibold text-church-charcoal hover:text-church-gold-warm"
                    >
                      {item.title}
                    </Link>
                    {item.scheduled_start_time && (
                      <p className="mt-1 text-sm text-church-charcoal/70">
                        {formatLagosCompact(item.scheduled_start_time)}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-church-charcoal/75">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="church" className="rounded-full">
                      <Link to={`/live/${item.id}`}>View details</Link>
                    </Button>
                    {cal && (
                      <Button asChild size="sm" variant="outline" className="rounded-full gap-1.5">
                        <a href={cal} target="_blank" rel="noopener noreferrer">
                          <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
                          Calendar
                        </a>
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => downloadLivestreamIcs(item)}
                    >
                      .ics
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default UpcomingBroadcasts;
