import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  max as maxDate,
  min as minDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import type { Event } from "@/services/event.service";
import { parseEventDate } from "@/lib/events";

/** Pure date logic for the events calendar (no React). Weeks start on Sunday. */

export type CalendarView = "month" | "week" | "day" | "agenda";

export const CALENDAR_VIEWS: Array<{ value: CalendarView; label: string }> = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "agenda", label: "Agenda" },
];

const WEEK = { weekStartsOn: 0 as const };

/** Default length for a timed event that has no end time. */
const DEFAULT_DURATION_MINUTES = 60;

export interface CalendarItem {
  event: Event;
  start: Date;
  /** Exclusive end. */
  end: Date;
  allDay: boolean;
  multiDay: boolean;
  cancelled: boolean;
}

export const isoDay = (date: Date) => format(date, "yyyy-MM-dd");

function withTime(day: Date, time?: string | null): Date | null {
  const match = time ? /^(\d{1,2}):(\d{2})/.exec(time) : null;
  if (!match) return null;
  const d = new Date(day);
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d;
}

/** Normalises an API event into concrete start/end instants. Returns null if it has no usable date. */
export function toCalendarItem(event: Event): CalendarItem | null {
  const startDay = parseEventDate(event.start_date);
  if (!startDay) return null;
  const endDay = parseEventDate(event.end_date) ?? startDay;

  const startAt = event.is_all_day ? null : withTime(startDay, event.start_time);
  const allDay = !startAt;

  let start: Date;
  let end: Date;
  if (allDay) {
    start = startOfDay(startDay);
    end = addDays(startOfDay(endDay < startDay ? startDay : endDay), 1);
  } else {
    start = startAt!;
    const endAt = withTime(endDay, event.end_time);
    end = endAt && endAt > start ? endAt : new Date(start.getTime() + DEFAULT_DURATION_MINUTES * 60_000);
  }

  return {
    event,
    start,
    end,
    allDay,
    multiDay: differenceInCalendarDays(subMs(end), start) > 0,
    cancelled: event.event_state === "cancelled" || event.status === "cancelled",
  };
}

/** Last instant covered by an exclusive end. */
const subMs = (date: Date) => new Date(date.getTime() - 1);

export function toCalendarItems(events: Event[]): CalendarItem[] {
  return events
    .map(toCalendarItem)
    .filter((item): item is CalendarItem => item !== null)
    .sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start.getTime() - b.start.getTime() || a.event.name.localeCompare(b.event.name));
}

/** Does the item touch this calendar day? */
export function occursOn(item: CalendarItem, day: Date): boolean {
  return item.start < endOfDay(day) && item.end > startOfDay(day);
}

export function itemsOn(items: CalendarItem[], day: Date): CalendarItem[] {
  return items.filter((item) => occursOn(item, day));
}

/** Range of days a view displays (inclusive), used both for rendering and fetching. */
export function visibleRange(view: CalendarView, date: Date): { start: Date; end: Date } {
  switch (view) {
    case "week":
      return { start: startOfWeek(date, WEEK), end: endOfWeek(date, WEEK) };
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "month":
    case "agenda":
    default:
      return { start: startOfWeek(startOfMonth(date), WEEK), end: endOfWeek(endOfMonth(date), WEEK) };
  }
}

export function daysIn(range: { start: Date; end: Date }): Date[] {
  const days: Date[] = [];
  for (let d = startOfDay(range.start); d <= range.end; d = addDays(d, 1)) days.push(d);
  return days;
}

export function step(view: CalendarView, date: Date, direction: 1 | -1): Date {
  switch (view) {
    case "week":
      return direction > 0 ? addWeeks(date, 1) : subWeeks(date, 1);
    case "day":
      return direction > 0 ? addDays(date, 1) : subDays(date, 1);
    default:
      return direction > 0 ? addMonths(date, 1) : subMonths(date, 1);
  }
}

export function viewTitle(view: CalendarView, date: Date): string {
  if (view === "day") return format(date, "EEEE, d MMMM yyyy");
  if (view === "week") {
    const { start, end } = visibleRange("week", date);
    if (start.getMonth() === end.getMonth()) return `${format(start, "d")} – ${format(end, "d MMMM yyyy")}`;
    if (start.getFullYear() === end.getFullYear()) return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`;
    return `${format(start, "d MMM yyyy")} – ${format(end, "d MMM yyyy")}`;
  }
  return format(date, "MMMM yyyy");
}

export interface PositionedItem {
  item: CalendarItem;
  /** Minutes from midnight, clipped to the day. */
  top: number;
  height: number;
  lane: number;
  lanes: number;
}

/**
 * Lays out a day's timed items into side-by-side lanes so overlapping events
 * don't cover each other (like Outlook/Google Calendar).
 */
export function layoutTimed(items: CalendarItem[], day: Date): PositionedItem[] {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  const timed = items
    .filter((item) => !item.allDay && occursOn(item, day))
    .map((item) => {
      const s = maxDate([item.start, dayStart]);
      const e = minDate([item.end, dayEnd]);
      return { item, s: (s.getTime() - dayStart.getTime()) / 60_000, e: (e.getTime() - dayStart.getTime()) / 60_000 };
    })
    .sort((a, b) => a.s - b.s || b.e - a.e);

  const out: PositionedItem[] = [];
  let cluster: Array<(typeof timed)[number] & { lane: number }> = [];
  let clusterEnd = -1;

  const flush = () => {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1));
    cluster.forEach((c) => out.push({ item: c.item, top: c.s, height: Math.max(c.e - c.s, 20), lane: c.lane, lanes }));
    cluster = [];
  };

  for (const entry of timed) {
    if (entry.s >= clusterEnd && cluster.length) flush();
    const used = new Set(cluster.filter((c) => c.e > entry.s).map((c) => c.lane));
    let lane = 0;
    while (used.has(lane)) lane++;
    cluster.push({ ...entry, lane });
    clusterEnd = Math.max(clusterEnd, entry.e);
  }
  if (cluster.length) flush();
  return out;
}

/** Hours shown in week/day views: 6:00–22:00, widened to fit any earlier/later event. */
export function visibleHours(items: CalendarItem[], days: Date[]): { from: number; to: number } {
  let from = 6;
  let to = 22;
  for (const day of days) {
    for (const p of layoutTimed(items, day)) {
      from = Math.min(from, Math.floor(p.top / 60));
      to = Math.max(to, Math.ceil((p.top + p.height) / 60));
    }
  }
  return { from: Math.max(0, from), to: Math.min(24, to) };
}

export function timeLabel(date: Date): string {
  return format(date, date.getMinutes() ? "h:mm a" : "h a");
}

export function itemTimeText(item: CalendarItem): string {
  if (item.allDay) return item.multiDay ? `${format(item.start, "d MMM")} – ${format(subMs(item.end), "d MMM")}` : "All day";
  const sameDay = isSameDay(item.start, subMs(item.end));
  return sameDay
    ? `${timeLabel(item.start)} – ${timeLabel(item.end)}`
    : `${format(item.start, "d MMM, h:mm a")} – ${format(item.end, "d MMM, h:mm a")}`;
}

/** Shifts an event to start on `toDay`, keeping its length. Returns API date fields. */
export function moveToDay(item: CalendarItem, toDay: Date): { start_date: string; end_date: string | null } {
  const shift = differenceInCalendarDays(toDay, item.start);
  const startDay = addDays(startOfDay(item.start), shift);
  const originalEnd = parseEventDate(item.event.end_date);
  return {
    start_date: isoDay(startDay),
    end_date: originalEnd ? isoDay(addDays(originalEnd, shift)) : null,
  };
}
