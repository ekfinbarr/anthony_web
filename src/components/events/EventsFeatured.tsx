import { Link } from "react-router-dom";
import { differenceInDays, differenceInHours } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/services/event.service";
import {
  eventCoverAlt,
  eventCoverSrc,
  eventExcerpt,
  eventHref,
  formatEventDate,
  formatEventTime,
  parseEventDate,
  primaryCategory,
  registrationStatusLabel,
} from "@/lib/events";

type EventsFeaturedProps = {
  event: Event;
};

const EventsFeatured = ({ event }: EventsFeaturedProps) => {
  const href = eventHref(event);
  const category = primaryCategory(event);
  const time = formatEventTime(event);
  const reg = registrationStatusLabel(event);
  const start = parseEventDate(event.start_date);
  const days = start ? differenceInDays(start, new Date()) : null;
  const hours = start ? differenceInHours(start, new Date()) : null;
  const showCountdown = days !== null && days >= 0 && days <= 30 && event.event_state !== "cancelled";

  return (
    <section aria-labelledby="featured-event-heading" className="mb-14">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px max-w-[3rem] flex-1 bg-gradient-church" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Featured Celebration</p>
      </div>

      <article className="overflow-hidden border border-church-gold-warm/20 bg-white lg:grid lg:grid-cols-12">
        <Link
          to={href}
          className="relative block aspect-[16/11] overflow-hidden bg-church-pearl lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]"
        >
          <img
            src={eventCoverSrc(event)}
            alt={eventCoverAlt(event)}
            width={1100}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-church-charcoal/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-church-charcoal/10" />
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-5 lg:p-10">
          {category && (
            <span className="mb-3 inline-flex w-fit bg-church-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm">
              {category.label}
            </span>
          )}

          <h2 id="featured-event-heading" className="font-serif text-2xl font-semibold leading-tight text-church-charcoal sm:text-3xl lg:text-[2rem]">
            <Link to={href} className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm">
              {event.name}
            </Link>
          </h2>

          <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
              <span>{formatEventDate(event)}</span>
            </li>
            {time && (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                <span>{time}</span>
              </li>
            )}
            {event.location && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                <span>{event.location}</span>
              </li>
            )}
          </ul>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-4">
            {eventExcerpt(event, 220)}
          </p>

          {showCountdown && (
            <p className="mt-4 text-sm font-medium text-church-charcoal" aria-live="polite">
              {days === 0
                ? hours !== null && hours <= 0
                  ? "Happening now"
                  : "Happening today"
                : days === 1
                  ? "Tomorrow"
                  : `In ${days} days`}
            </p>
          )}

          {reg && <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-church-gold-warm">{reg}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="church">
              <Link to={href}>View Event</Link>
            </Button>
            {event.rsvp_enabled && event.registration_open && event.event_state !== "cancelled" && (
              <Button asChild variant="outlineGold">
                <Link to={`${href}#register`}>Register</Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </section>
  );
};

export default EventsFeatured;
