import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ExternalLink, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { eventHref } from "@/lib/events";
import eventService, { type Event } from "@/services/event.service";
import { EventCalendar } from "./EventCalendar";
import { isoDay, moveToDay, visibleRange, type CalendarItem, type CalendarView } from "./calendarModel";

const VIEWS: CalendarView[] = ["month", "week", "day", "agenda"];

/**
 * Staff calendar for /admin/events: shows drafts, creates events from a day or
 * time slot, and reschedules by drag-and-drop (with undo).
 */
export function AdminEventsCalendar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get("cal") as CalendarView | null;
  const view: CalendarView = viewParam && VIEWS.includes(viewParam) ? viewParam : "month";
  const dateParam = searchParams.get("on");
  const [date, setDate] = useState<Date>(() =>
    dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? new Date(`${dateParam}T12:00:00`) : new Date()
  );

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const range = visibleRange(view, date);
  const from = isoDay(range.start);
  const to = isoDay(range.end);

  const { data: events = [], isFetching } = useQuery({
    queryKey: ["events", "admin-calendar", from, to],
    queryFn: () => eventService.getAdminCalendar({ from, to }),
    placeholderData: keepPreviousData,
  });

  const move = useMutation({
    mutationFn: ({ event, dates }: { event: Event; dates: { start_date: string; end_date: string | null } }) =>
      eventService.update(event.id, dates),
    onSuccess: (_res, { event, dates }) => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      const previous = { start_date: event.start_date, end_date: event.end_date ?? null };
      notify.success(`Moved “${event.name}”`, {
        description: `Now on ${format(new Date(`${dates.start_date}T12:00:00`), "EEEE d MMMM")}.`,
        action: { label: "Undo", onClick: () => move.mutate({ event: { ...event, ...dates }, dates: previous }) },
      });
    },
    onError: (error) => notify.error(error, { description: "The event could not be moved." }),
  });

  const onMoveEvent = (item: CalendarItem, toDay: Date) => {
    move.mutate({ event: item.event, dates: moveToDay(item, toDay) });
  };

  const onCreateAt = (day: Date, time?: string) => {
    const params = new URLSearchParams({ date: isoDay(day) });
    if (time) params.set("time", time);
    navigate(`/admin/events/new?${params.toString()}`);
  };

  return (
    <EventCalendar
      events={events}
      loading={isFetching || move.isPending}
      view={view}
      date={date}
      onViewChange={(v) => setParam("cal", v)}
      onDateChange={(d) => {
        setDate(d);
        setParam("on", isoDay(d));
      }}
      onCreateAt={onCreateAt}
      onMoveEvent={onMoveEvent}
      showStatus
      renderActions={(event) => (
        <>
          <Button size="sm" onClick={() => navigate(`/admin/events/${event.id}/edit`)}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit event
          </Button>
          {event.slug && event.is_published !== false && (
            <Button size="sm" variant="outline" asChild>
              <a href={eventHref(event)} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Public page
              </a>
            </Button>
          )}
        </>
      )}
    />
  );
}

export default AdminEventsCalendar;
