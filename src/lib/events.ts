import { format, isToday, isTomorrow, isThisWeek, parseISO, startOfDay } from "date-fns";
import type { Event } from "@/services/event.service";
import { mediaUrl } from "@/components/parish-home/media";
import churchBanner from "@/assets/images/st_anthony.webp";

export function eventHref(event: Pick<Event, "slug" | "id">): string {
  return event.slug ? `/events/${event.slug}` : `/events`;
}

export function eventCoverSrc(event: Pick<Event, "image">): string {
  const url = mediaUrl(typeof event.image === "string" ? event.image : null);
  return url || churchBanner;
}

export function eventCoverAlt(event: Pick<Event, "name">): string {
  return event.name ? `${event.name} — St. Anthony Catholic Church, Gbaja` : "Parish event";
}

export function primaryCategory(event: Event): { label: string; slug: string } | null {
  const cat = event.categories?.[0];
  if (!cat) return null;
  return { label: cat.label || cat.name, slug: cat.slug };
}

export function eventExcerpt(event: Event, max = 160): string {
  const raw = (event.summary || event.description || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max - 1).trim()}…`;
}

export function parseEventDate(value?: string | null): Date | null {
  if (!value) return null;
  try {
    return parseISO(value);
  } catch {
    return null;
  }
}

export function formatEventDate(event: Event): string {
  const start = parseEventDate(event.start_date);
  if (!start) return "";
  if (event.is_all_day) {
    if (event.end_date) {
      const end = parseEventDate(event.end_date);
      if (end && format(end, "yyyy-MM-dd") !== format(start, "yyyy-MM-dd")) {
        return `${format(start, "EEE, MMM d")} – ${format(end, "EEE, MMM d, yyyy")}`;
      }
    }
    return format(start, "EEEE, MMMM d, yyyy");
  }
  return format(start, "EEEE, MMMM d, yyyy");
}

export function formatEventTime(event: Event): string | null {
  if (event.is_all_day) return "All day";
  const start = parseEventDate(event.start_date);
  if (!start) return null;
  const hasTime = event.start_time || (event.start_date && event.start_date.includes("T"));
  if (!hasTime) return null;
  const startLabel = format(start, "h:mm a");
  const end = parseEventDate(event.end_date || event.end_time);
  if (end && event.end_date) {
    return `${startLabel} – ${format(end, "h:mm a")}`;
  }
  return startLabel;
}

export function formatCompactDate(event: Event): { weekday: string; day: string; month: string } {
  const start = parseEventDate(event.start_date) || new Date();
  return {
    weekday: format(start, "EEE"),
    day: format(start, "d"),
    month: format(start, "MMM"),
  };
}

export function relativeDateLabel(event: Event): string | null {
  const start = parseEventDate(event.start_date);
  if (!start) return null;
  const day = startOfDay(start);
  if (isToday(day)) return "Today";
  if (isTomorrow(day)) return "Tomorrow";
  if (isThisWeek(day, { weekStartsOn: 0 })) return "This Week";
  return "Upcoming";
}

export function registrationStatusLabel(event: Event): string | null {
  if (!event.rsvp_enabled) return null;
  if (event.event_state === "cancelled") return "Registration closed";
  if (event.registration_open === false) {
    if (event.available_spaces === 0) return "Fully booked";
    return "Registration closed";
  }
  return "Registration open";
}

export function buildGoogleCalendarUrl(event: Event): string | null {
  const start = parseEventDate(event.start_date);
  if (!start) return null;
  const end = parseEventDate(event.end_date) || new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d: Date, allDay: boolean) => {
    if (allDay) return format(d, "yyyyMMdd");
    return format(d, "yyyyMMdd'T'HHmmss");
  };
  const dates = event.is_all_day
    ? `${fmt(start, true)}/${fmt(end, true)}`
    : `${fmt(start, false)}/${fmt(end, false)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name,
    dates,
    details: eventExcerpt(event, 500),
    location: event.venue_address || event.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsBlob(event: Event): Blob | null {
  const start = parseEventDate(event.start_date);
  if (!start) return null;
  const end = parseEventDate(event.end_date) || new Date(start.getTime() + 60 * 60 * 1000);
  const stamp = (d: Date, allDay: boolean) =>
    allDay ? format(d, "yyyyMMdd") : format(d, "yyyyMMdd'T'HHmmss");
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const uid = `${event.id || event.slug}@stanthonygbaja`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St Anthony Catholic Church Gbaja//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date(), false)}Z`,
    event.is_all_day ? `DTSTART;VALUE=DATE:${stamp(start, true)}` : `DTSTART:${stamp(start, false)}`,
    event.is_all_day ? `DTEND;VALUE=DATE:${stamp(end, true)}` : `DTEND:${stamp(end, false)}`,
    `SUMMARY:${escape(event.name)}`,
    `DESCRIPTION:${escape(eventExcerpt(event, 800))}`,
    `LOCATION:${escape(event.venue_address || event.location || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
}

export function downloadIcs(event: Event): boolean {
  const blob = buildIcsBlob(event);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.slug || "event"}.ics`;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export function mapsDirectionsUrl(event: Event): string | null {
  const q = event.venue_address || event.location;
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
