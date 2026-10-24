import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Event } from "@/services/event.service";
import { eventHref, formatCompactDate, formatEventTime, primaryCategory } from "@/lib/events";

type EventsComingUpProps = {
  events: Event[];
};

const EventsComingUp = ({ events }: EventsComingUpProps) => {
  if (!events.length) return null;

  return (
    <section aria-labelledby="coming-up-heading" className="mb-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Coming Up</p>
          <h2 id="coming-up-heading" className="mt-1 font-serif text-2xl font-semibold text-church-charcoal">
            Soon at the parish
          </h2>
        </div>
      </div>

      <ul className="divide-y divide-church-gold-warm/15 border border-church-gold-warm/15 bg-white">
        {events.map((event) => {
          const date = formatCompactDate(event);
          const time = formatEventTime(event);
          const category = primaryCategory(event);
          return (
            <li key={event.id}>
              <Link
                to={eventHref(event)}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-church-pearl/60 focus-visible:bg-church-pearl/60 sm:px-5"
              >
                <div className="flex w-12 shrink-0 flex-col items-center text-center">
                  <span className="text-[10px] font-semibold uppercase text-church-gold-warm">{date.month}</span>
                  <span className="font-serif text-lg font-semibold leading-none text-church-charcoal">{date.day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-church-charcoal">{event.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[time, event.location, category?.label].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default EventsComingUp;
