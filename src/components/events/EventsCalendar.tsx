import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/services/event.service";
import { eventHref, formatEventTime, parseEventDate } from "@/lib/events";
import { cn } from "@/lib/utils";

type EventsCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: string | null;
  onSelectDate: (isoDate: string | null) => void;
  events: Event[];
  isLoading?: boolean;
};

const EventsCalendar = ({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  events,
  isLoading,
}: EventsCalendarProps) => {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const start = parseEventDate(event.start_date);
      if (!start) return;
      const end = parseEventDate(event.end_date) || start;
      let cursor = start;
      while (cursor <= end) {
        const key = format(cursor, "yyyy-MM-dd");
        const list = map.get(key) || [];
        list.push(event);
        map.set(key, list);
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const selected = selectedDate ? parseISO(selectedDate) : null;
  const dayEvents = selectedDate ? eventsByDay.get(selectedDate) || [] : [];

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="border border-church-gold-warm/15 bg-white p-4 sm:p-5 lg:col-span-7">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-church-charcoal">
            {format(month, "MMMM yyyy")}
          </h3>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => onMonthChange(subMonths(month, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => onMonthChange(addMonths(month, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Events calendar">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const count = eventsByDay.get(key)?.length || 0;
            const inMonth = isSameMonth(day, month);
            const isSelected = selected && isSameDay(day, selected);
            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                aria-selected={Boolean(isSelected)}
                aria-label={`${format(day, "MMMM d, yyyy")}${count ? `, ${count} event${count > 1 ? "s" : ""}` : ""}`}
                onClick={() => onSelectDate(isSelected ? null : key)}
                className={cn(
                  "relative flex min-h-[2.75rem] flex-col items-center justify-center rounded-sm p-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold-warm",
                  inMonth ? "text-church-charcoal" : "text-muted-foreground/50",
                  isSelected && "bg-church-gold/25",
                  !isSelected && inMonth && "hover:bg-church-pearl",
                )}
              >
                <span className="font-medium">{format(day, "d")}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "mt-0.5 h-1.5 w-1.5 rounded-full",
                      isSelected ? "bg-church-charcoal" : "bg-church-gold-warm",
                    )}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
        {isLoading && <p className="mt-3 text-center text-xs text-muted-foreground">Updating calendar…</p>}
      </div>

      <div className="lg:col-span-5">
        <h3 className="font-serif text-lg font-semibold text-church-charcoal">
          {selected ? format(selected, "EEEE, MMMM d") : "Select a date"}
        </h3>
        {!selected && (
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a day with a gold marker to see events scheduled then.
          </p>
        )}
        {selected && dayEvents.length === 0 && (
          <p className="mt-4 border border-dashed border-church-gold-warm/25 bg-church-pearl/30 px-4 py-8 text-center text-sm text-muted-foreground">
            No events scheduled on this date.
          </p>
        )}
        {selected && dayEvents.length > 0 && (
          <ul className="mt-4 space-y-3">
            {dayEvents.map((event) => (
              <li key={event.id} className="border border-church-gold-warm/15 bg-white p-4">
                <Link to={eventHref(event)} className="font-medium text-church-charcoal hover:text-church-gold-warm">
                  {event.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[formatEventTime(event), event.location].filter(Boolean).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventsCalendar;
