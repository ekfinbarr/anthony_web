import { useEffect, useMemo, useState, type DragEvent, type ReactNode } from "react";
import { format, isSameDay, isSameMonth, isToday, isWeekend, startOfDay } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Event } from "@/services/event.service";
import {
  CALENDAR_VIEWS,
  daysIn,
  isoDay,
  itemTimeText,
  itemsOn,
  layoutTimed,
  step,
  toCalendarItems,
  viewTitle,
  visibleHours,
  visibleRange,
  type CalendarItem,
  type CalendarView,
} from "./calendarModel";

const HOUR_PX = 48;
const MONTH_CHIPS = 3;

export interface EventCalendarProps {
  events: Event[];
  loading?: boolean;
  view: CalendarView;
  date: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
  /** Buttons for the quick-view dialog (e.g. "View event", "Edit"). */
  renderActions?: (event: Event) => ReactNode;
  /** Enables click-to-create on days and time slots (staff). */
  onCreateAt?: (day: Date, time?: string) => void;
  /** Enables drag-and-drop rescheduling in month view (staff). */
  onMoveEvent?: (item: CalendarItem, toDay: Date) => void;
  /** Show draft/published state on chips (staff). */
  showStatus?: boolean;
}

// ---- Shared bits ---------------------------------------------------------------

function chipTone(item: CalendarItem, showStatus: boolean) {
  if (item.cancelled) return "border-red-300/70 bg-red-50 text-red-800 line-through decoration-red-400/70 dark:bg-red-950/30 dark:text-red-200";
  if (showStatus && (item.event.is_published === false || item.event.status === "draft")) {
    return "border-dashed border-muted-foreground/40 bg-muted/60 text-muted-foreground";
  }
  return "border-church-gold/40 bg-church-gold/[0.14] text-church-charcoal dark:text-church-pearl";
}

function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function EventChip({
  item,
  showStatus,
  onOpen,
  draggable,
  compact,
}: {
  item: CalendarItem;
  showStatus: boolean;
  onOpen: (item: CalendarItem) => void;
  draggable?: boolean;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/event-id", String(item.event.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen(item);
      }}
      className={cn(
        "group/chip flex w-full min-w-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-left text-[11px] leading-4 transition-all duration-150",
        "hover:-translate-y-px hover:border-church-gold-warm hover:shadow-[0_4px_12px_-4px_hsl(var(--church-gold-warm)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        draggable && "cursor-grab active:cursor-grabbing",
        chipTone(item, showStatus)
      )}
      title={`${item.event.name} · ${itemTimeText(item)}`}
    >
      {!item.allDay && !compact && (
        <span className="shrink-0 font-semibold tabular-nums">{format(item.start, item.start.getMinutes() ? "h:mm" : "h a")}</span>
      )}
      <span className="truncate font-medium">{item.event.name}</span>
    </button>
  );
}

// ---- Month -------------------------------------------------------------------------

function MonthView({
  date,
  items,
  showStatus,
  onOpen,
  onCreateAt,
  onMoveEvent,
}: {
  date: Date;
  items: CalendarItem[];
  showStatus: boolean;
  onOpen: (item: CalendarItem) => void;
  onCreateAt?: (day: Date) => void;
  onMoveEvent?: (item: CalendarItem, toDay: Date) => void;
}) {
  const days = useMemo(() => daysIn(visibleRange("month", date)), [date]);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selected, setSelected] = useState<Date>(() => (isSameMonth(new Date(), date) ? startOfDay(new Date()) : startOfDay(date)));
  const byId = useMemo(() => new Map(items.map((i) => [String(i.event.id), i])), [items]);

  const onDrop = (day: Date) => (e: DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
    const item = byId.get(e.dataTransfer.getData("text/event-id"));
    if (item && onMoveEvent && !isSameDay(item.start, day)) onMoveEvent(item, day);
  };

  const selectedItems = itemsOn(items, selected);

  return (
    <div>
      <div className="grid grid-cols-7 border-b text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {days.slice(0, 7).map((d) => (
          <div key={d.toISOString()} className="py-2">
            <span className="hidden sm:inline">{format(d, "EEE")}</span>
            <span className="sm:hidden">{format(d, "EEEEE")}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = isoDay(day);
          const dayItems = itemsOn(items, day);
          const inMonth = isSameMonth(day, date);
          const isSelected = isSameDay(day, selected);
          return (
            <div
              key={key}
              onDragOver={onMoveEvent ? (e) => { e.preventDefault(); setDropTarget(key); } : undefined}
              onDragLeave={onMoveEvent ? () => setDropTarget((t) => (t === key ? null : t)) : undefined}
              onDrop={onMoveEvent ? onDrop(day) : undefined}
              className={cn(
                "group/day relative min-h-[3.5rem] border-b border-r p-1 transition-colors sm:min-h-[7.5rem] sm:p-1.5 [&:nth-child(7n)]:border-r-0",
                !inMonth && "bg-muted/30",
                isWeekend(day) && inMonth && "bg-church-stone/40 dark:bg-white/[0.02]",
                dropTarget === key && "bg-church-gold/15 ring-2 ring-inset ring-church-gold-warm",
                "hover:bg-church-gold/[0.05]"
              )}
            >
              <div className="flex items-start justify-between">
                <button
                  type="button"
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    !inMonth && "text-muted-foreground/60",
                    isToday(day) && "bg-church-gold-warm font-bold text-white shadow-[0_0_0_3px_hsl(var(--church-gold)/0.25)]",
                    !isToday(day) && "hover:bg-muted",
                    isSelected && !isToday(day) && "ring-1 ring-church-gold-warm sm:ring-0"
                  )}
                  aria-label={`${format(day, "EEEE d MMMM")}${dayItems.length ? `, ${dayItems.length} event${dayItems.length === 1 ? "" : "s"}` : ""}`}
                  aria-pressed={isSelected}
                >
                  {format(day, "d")}
                </button>
                {onCreateAt && (
                  <button
                    type="button"
                    onClick={() => onCreateAt(day)}
                    className="hidden h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-church-gold/20 hover:text-church-charcoal focus-visible:opacity-100 group-hover/day:opacity-100 sm:flex"
                    aria-label={`Create event on ${format(day, "d MMMM")}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Phones: dots; the selected day's events are listed below the grid. */}
              {dayItems.length > 0 && (
                <div className="mt-1 flex flex-wrap justify-center gap-0.5 sm:hidden" aria-hidden>
                  {dayItems.slice(0, 3).map((i) => (
                    <span key={String(i.event.id)} className={cn("h-1.5 w-1.5 rounded-full", i.cancelled ? "bg-red-400" : "bg-church-gold-warm")} />
                  ))}
                </div>
              )}

              {/* Tablet and up: chips */}
              <div className="mt-1 hidden space-y-0.5 sm:block">
                {dayItems.slice(0, MONTH_CHIPS).map((item) => (
                  <EventChip key={String(item.event.id)} item={item} showStatus={showStatus} onOpen={onOpen} draggable={!!onMoveEvent} />
                ))}
                {dayItems.length > MONTH_CHIPS && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="w-full rounded px-1.5 text-left text-[11px] font-semibold text-church-gold-warm hover:underline">
                        +{dayItems.length - MONTH_CHIPS} more
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 space-y-1 p-2" align="start">
                      <p className="px-1 pb-1 text-xs font-semibold">{format(day, "EEEE d MMMM")}</p>
                      {dayItems.map((item) => (
                        <EventChip key={String(item.event.id)} item={item} showStatus={showStatus} onOpen={onOpen} draggable={!!onMoveEvent} />
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phone day list */}
      <div className="space-y-2 border-t p-3 sm:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{format(selected, "EEEE, d MMMM")}</p>
          {onCreateAt && (
            <Button size="sm" variant="outline" className="h-8" onClick={() => onCreateAt(selected)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add
            </Button>
          )}
        </div>
        {selectedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events on this day.</p>
        ) : (
          selectedItems.map((item) => <AgendaRow key={String(item.event.id)} item={item} showStatus={showStatus} onOpen={onOpen} />)
        )}
      </div>
    </div>
  );
}

// ---- Week / Day ----------------------------------------------------------------------

function TimeGridView({
  days,
  items,
  showStatus,
  onOpen,
  onCreateAt,
}: {
  days: Date[];
  items: CalendarItem[];
  showStatus: boolean;
  onOpen: (item: CalendarItem) => void;
  onCreateAt?: (day: Date, time?: string) => void;
}) {
  const now = useNow();
  const { from, to } = useMemo(() => visibleHours(items, days), [items, days]);
  const hours = Array.from({ length: to - from }, (_, i) => from + i);
  const allDay = days.map((day) => items.filter((i) => i.allDay && itemsOn([i], day).length > 0));
  const hasAllDay = allDay.some((list) => list.length > 0);
  const multi = days.length > 1;

  return (
    <div className="overflow-x-auto">
      <div className={cn(multi && "min-w-[44rem]")}>
        {/* Day headers */}
        <div className="grid border-b" style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
          <div />
          {days.map((day) => (
            <div key={day.toISOString()} className="border-l py-2 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{format(day, "EEE")}</p>
              <p className={cn("mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-base font-semibold", isToday(day) && "bg-church-gold-warm text-white")}>
                {format(day, "d")}
              </p>
            </div>
          ))}
        </div>

        {/* All-day row */}
        {hasAllDay && (
          <div className="grid border-b bg-muted/20" style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
            <div className="py-1.5 pr-2 text-right text-[10px] uppercase text-muted-foreground">All day</div>
            {allDay.map((list, i) => (
              <div key={i} className="space-y-0.5 border-l p-1">
                {list.map((item) => <EventChip key={String(item.event.id)} item={item} showStatus={showStatus} onOpen={onOpen} />)}
              </div>
            ))}
          </div>
        )}

        {/* Hours */}
        <div className="grid" style={{ gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))` }}>
          <div>
            {hours.map((h) => (
              <div key={h} className="relative pr-2 text-right text-[10px] text-muted-foreground" style={{ height: HOUR_PX }}>
                <span className="-translate-y-1/2 absolute right-2 top-0">{h === from ? "" : format(new Date(2000, 0, 1, h), "h a")}</span>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const positioned = layoutTimed(items, day);
            const nowTop = (now.getHours() * 60 + now.getMinutes() - from * 60) * (HOUR_PX / 60);
            return (
              <div key={day.toISOString()} className={cn("relative border-l", isToday(day) && "bg-church-gold/[0.03]")} style={{ height: hours.length * HOUR_PX }}>
                {hours.map((h) => (
                  <div key={h} className="border-b border-dashed border-border/60" style={{ height: HOUR_PX }}>
                    {onCreateAt &&
                      [0, 30].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onCreateAt(day, `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)}
                          className="block h-1/2 w-full transition-colors hover:bg-church-gold/10 focus-visible:bg-church-gold/10 focus-visible:outline-none"
                          aria-label={`Create event on ${format(day, "d MMMM")} at ${format(new Date(2000, 0, 1, h, m), "h:mm a")}`}
                        />
                      ))}
                  </div>
                ))}

                {positioned.map((p) => {
                  const top = (p.top - from * 60) * (HOUR_PX / 60);
                  const height = Math.max(p.height * (HOUR_PX / 60) - 2, 18);
                  const width = 100 / p.lanes;
                  return (
                    <button
                      key={String(p.item.event.id)}
                      type="button"
                      onClick={() => onOpen(p.item)}
                      className={cn(
                        "absolute overflow-hidden rounded-md border px-1.5 py-1 text-left text-[11px] leading-tight transition-all duration-150",
                        "hover:z-10 hover:shadow-[0_8px_20px_-8px_hsl(var(--church-gold-warm)/0.6)] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        chipTone(p.item, showStatus)
                      )}
                      style={{ top, height, left: `calc(${p.lane * width}% + 2px)`, width: `calc(${width}% - 4px)` }}
                      title={`${p.item.event.name} · ${itemTimeText(p.item)}`}
                    >
                      <p className="truncate font-semibold">{p.item.event.name}</p>
                      {height > 30 && <p className="truncate opacity-80">{itemTimeText(p.item)}</p>}
                      {height > 48 && p.item.event.location && <p className="truncate opacity-70">{p.item.event.location}</p>}
                    </button>
                  );
                })}

                {isToday(day) && nowTop >= 0 && nowTop <= hours.length * HOUR_PX && (
                  <div className="pointer-events-none absolute inset-x-0 z-20" style={{ top: nowTop }} aria-hidden>
                    <div className="relative h-0.5 bg-red-500">
                      <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---- Agenda --------------------------------------------------------------------------

function AgendaRow({ item, showStatus, onOpen }: { item: CalendarItem; showStatus: boolean; onOpen: (item: CalendarItem) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-church-gold/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className={cn("mt-1 h-full min-h-[2.25rem] w-1 shrink-0 rounded-full", item.cancelled ? "bg-red-400" : "bg-church-gold-warm")} aria-hidden />
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className={cn("block truncate text-sm font-semibold", item.cancelled && "line-through")}>{item.event.name}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{itemTimeText(item)}</span>
          {item.event.location && <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="h-3 w-3 shrink-0" aria-hidden /><span className="truncate">{item.event.location}</span></span>}
        </span>
      </span>
      {showStatus && (item.event.is_published === false || item.event.status === "draft") && (
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Draft</span>
      )}
      {item.cancelled && <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-red-700">Cancelled</span>}
    </button>
  );
}

type AgendaSort = "date_asc" | "date_desc" | "name";

function AgendaView({ date, items, showStatus, onOpen }: { date: Date; items: CalendarItem[]; showStatus: boolean; onOpen: (item: CalendarItem) => void }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<AgendaSort>("date_asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const monthStart = startOfMonthOf(date);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const monthItems = items.filter((i) => i.start < nextMonth && i.end > monthStart);
    return monthItems.filter((i) => !q || `${i.event.name} ${i.event.location ?? ""} ${i.event.summary ?? ""}`.toLowerCase().includes(q));
  }, [items, query, date]);

  const groups = useMemo(() => {
    if (sort === "name") {
      return [{ key: "all", label: null as string | null, items: [...filtered].sort((a, b) => a.event.name.localeCompare(b.event.name)) }];
    }
    const map = new Map<string, CalendarItem[]>();
    for (const item of filtered) {
      const key = isoDay(item.start < startOfMonthOf(date) ? startOfMonthOf(date) : item.start);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    const keys = [...map.keys()].sort();
    if (sort === "date_desc") keys.reverse();
    return keys.map((key) => ({ key, label: format(new Date(`${key}T12:00:00`), "EEEE, d MMMM"), items: map.get(key)! }));
  }, [filtered, sort, date]);

  return (
    <div className="space-y-4 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events this month…" className="pl-9" aria-label="Search events" />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as AgendaSort)}>
          <SelectTrigger className="sm:w-48" aria-label="Sort events">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_asc">Date (earliest first)</SelectItem>
            <SelectItem value="date_desc">Date (latest first)</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {groups.length === 0 || filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <CalendarDays className="h-8 w-8" aria-hidden />
          <p className="text-sm">{query ? "No events match your search." : "No events this month."}</p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="space-y-2">
            {group.label && (
              <h3 className="sticky top-0 z-[1] bg-background/95 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
                {group.label}
              </h3>
            )}
            {group.items.map((item) => <AgendaRow key={`${group.key}-${String(item.event.id)}`} item={item} showStatus={showStatus} onOpen={onOpen} />)}
          </section>
        ))
      )}
    </div>
  );
}

const startOfMonthOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

// ---- Calendar ---------------------------------------------------------------------------

export function EventCalendar({
  events,
  loading,
  view,
  date,
  onViewChange,
  onDateChange,
  renderActions,
  onCreateAt,
  onMoveEvent,
  showStatus = false,
}: EventCalendarProps) {
  const items = useMemo(() => toCalendarItems(events), [events]);
  const [open, setOpen] = useState<CalendarItem | null>(null);
  const days = useMemo(() => daysIn(visibleRange(view, date)), [view, date]);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b bg-gradient-to-r from-church-gold/[0.07] to-transparent p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
            Today
          </Button>
          <div className="flex">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onDateChange(step(view === "agenda" ? "month" : view, date, -1))} aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onDateChange(step(view === "agenda" ? "month" : view, date, 1))} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="min-w-0 truncate font-heading text-lg font-semibold" aria-live="polite">
            {viewTitle(view === "agenda" ? "month" : view, date)}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onViewChange(v as CalendarView)}
            className="grid flex-1 grid-cols-4 rounded-lg border bg-background p-0.5 sm:flex-none"
            aria-label="Calendar view"
          >
            {CALENDAR_VIEWS.map((v) => (
              <ToggleGroupItem
                key={v.value}
                value={v.value}
                className="h-8 px-3 text-xs data-[state=on]:bg-church-charcoal data-[state=on]:text-church-pearl"
              >
                {v.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {onCreateAt && (
            <Button size="sm" className="h-9 shrink-0" onClick={() => onCreateAt(view === "month" || view === "agenda" ? startOfDay(new Date()) : date)}>
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">New event</span>
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={cn("relative transition-opacity", loading && "opacity-60")} aria-busy={loading}>
        {loading && events.length === 0 ? (
          <div className="grid grid-cols-7 gap-px p-3">
            {Array.from({ length: 35 }).map((_, i) => <Skeleton key={i} className="h-14 sm:h-24" />)}
          </div>
        ) : view === "month" ? (
          <MonthView
            date={date}
            items={items}
            showStatus={showStatus}
            onOpen={setOpen}
            onCreateAt={onCreateAt}
            onMoveEvent={onMoveEvent}
          />
        ) : view === "agenda" ? (
          <AgendaView date={date} items={items} showStatus={showStatus} onOpen={setOpen} />
        ) : (
          <TimeGridView days={days} items={items} showStatus={showStatus} onOpen={setOpen} onCreateAt={onCreateAt} />
        )}
      </div>

      {onMoveEvent && view === "month" && (
        <p className="hidden border-t px-4 py-2 text-xs text-muted-foreground sm:block">
          Tip: drag an event to another day to reschedule it. Click a day’s + or an empty time slot to create an event.
        </p>
      )}

      {/* Quick view */}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-w-md border-church-gold/20">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle className={cn("pr-6 font-heading text-xl", open.cancelled && "line-through")}>{open.event.name}</DialogTitle>
                <DialogDescription className="space-y-1.5 pt-1 text-left">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-church-gold-warm" aria-hidden />{format(open.start, "EEEE, d MMMM yyyy")}</span>
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-church-gold-warm" aria-hidden />{itemTimeText(open)}</span>
                  {open.event.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-church-gold-warm" aria-hidden />{open.event.location}</span>}
                </DialogDescription>
              </DialogHeader>
              {open.event.summary && <p className="text-sm leading-relaxed">{open.event.summary}</p>}
              <div className="flex flex-wrap gap-2">
                {open.cancelled && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">Cancelled</span>}
                {showStatus && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold capitalize">
                    {open.event.is_published === false ? "Draft" : open.event.status ?? "Published"}
                  </span>
                )}
                {(open.event.categories ?? []).map((c) => (
                  <span key={String(c.id)} className="rounded-full border px-2.5 py-0.5 text-xs">{c.name}</span>
                ))}
              </div>
              {renderActions && <DialogFooter className="gap-2 sm:justify-start">{renderActions(open.event)}</DialogFooter>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EventCalendar;
