import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { Event } from "@/services/event.service";
import {
  eventCoverAlt,
  eventCoverSrc,
  eventExcerpt,
  eventHref,
  formatCompactDate,
  formatEventTime,
  primaryCategory,
  registrationStatusLabel,
} from "@/lib/events";

type EventCardProps = {
  event: Event;
  past?: boolean;
};

const EventCard = ({ event, past = false }: EventCardProps) => {
  const href = eventHref(event);
  const date = formatCompactDate(event);
  const time = formatEventTime(event);
  const category = primaryCategory(event);
  const reg = past ? null : registrationStatusLabel(event);
  const cancelled = event.event_state === "cancelled";

  return (
    <article className="group flex flex-col overflow-hidden border border-church-gold-warm/15 bg-white transition-shadow duration-300 hover:shadow-md focus-within:shadow-md">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-church-pearl">
        <img
          src={eventCoverSrc(event)}
          alt={eventCoverAlt(event)}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex min-w-[3.25rem] flex-col items-center bg-white/95 px-2 py-1.5 text-center shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-church-gold-warm">{date.month}</span>
          <span className="font-serif text-xl font-semibold leading-none text-church-charcoal">{date.day}</span>
          <span className="mt-0.5 text-[10px] uppercase text-muted-foreground">{date.weekday}</span>
        </div>
        {cancelled && (
          <span className="absolute right-3 top-3 bg-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive-foreground">
            Cancelled
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm">
            {category.label}
          </span>
        )}
        <h3 className="font-serif text-lg font-semibold leading-snug text-church-charcoal">
          <Link to={href} className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm">
            {event.name}
          </Link>
        </h3>
        {time && <p className="mt-2 text-sm text-muted-foreground">{time}</p>}
        {event.location && (
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-church-gold-warm" aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        )}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{eventExcerpt(event, 120)}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {reg && (
            <span className="text-xs font-medium text-church-gold-warm">{reg}</span>
          )}
          <Link
            to={href}
            className="ml-auto text-sm font-semibold text-church-charcoal underline-offset-4 transition-colors hover:text-church-gold-warm hover:underline"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
