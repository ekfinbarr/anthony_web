import { Link } from "react-router-dom";
import type { Event } from "@/services/event.service";
import EventCard from "@/components/events/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type EventsPastArchiveProps = {
  events: Event[];
  year?: string;
  years: number[];
  onYearChange: (year: string) => void;
};

const EventsPastArchive = ({ events, year, years, onYearChange }: EventsPastArchiveProps) => {
  return (
    <section aria-labelledby="past-events-heading" className="mt-16 border-t border-church-gold-warm/20 pt-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Previous Celebrations</p>
          <h2 id="past-events-heading" className="mt-1 font-serif text-2xl font-semibold text-church-charcoal">
            Past Events
          </h2>
        </div>
        {years.length > 0 && (
          <Select
            value={year || "all"}
            onValueChange={(value) => onYearChange(value === "all" ? "" : value)}
          >
            <SelectTrigger
              aria-label="Filter by year"
              className="w-full border-church-gold-warm/25 bg-white sm:w-[9.5rem]"
            >
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Past celebrations will appear here. You can also browse the{" "}
          <Link to="/gallery" className="text-church-gold-warm underline-offset-4 hover:underline">
            parish gallery
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} past />
          ))}
        </div>
      )}
    </section>
  );
};

export default EventsPastArchive;
