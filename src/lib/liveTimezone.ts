/**
 * Parish livestream timezone helpers.
 * Display and schedule composition use Africa/Lagos; API stores UTC ISO strings.
 */

export const PARISH_TIMEZONE = "Africa/Lagos";

const lagosParts = (iso: string | Date) => {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARISH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
};

/** Human-readable date/time in WAT, e.g. "Sunday, 26 October 2026 at 9:00 AM WAT". */
export function formatInLagos(
  iso?: string | null,
  options?: { dateOnly?: boolean; timeOnly?: boolean }
): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";

    if (options?.dateOnly) {
      return new Intl.DateTimeFormat("en-GB", {
        timeZone: PARISH_TIMEZONE,
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    }

    if (options?.timeOnly) {
      const time = new Intl.DateTimeFormat("en-GB", {
        timeZone: PARISH_TIMEZONE,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(d);
      return `${time} WAT`;
    }

    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: PARISH_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: PARISH_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${date} at ${time} WAT`;
  } catch {
    return "";
  }
}

/** Compact label for cards: "26 Oct · 9:00 AM WAT". */
export function formatLagosCompact(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat("en-GB", {
      timeZone: PARISH_TIMEZONE,
      day: "numeric",
      month: "short",
    }).format(d);
    const time = new Intl.DateTimeFormat("en-GB", {
      timeZone: PARISH_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
    return `${date} · ${time} WAT`;
  } catch {
    return "";
  }
}

/**
 * Combine a calendar date + clock time interpreted as Africa/Lagos into a UTC ISO string.
 */
export function combineLagosDateAndTime(
  date?: Date,
  time?: { hours: number; minutes: number }
): string | undefined {
  if (!date) return undefined;
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const hours = time?.hours ?? 0;
  const minutes = time?.minutes ?? 0;

  const pad = (n: number) => String(n).padStart(2, "0");
  // Construct an ISO-like local wall time, then resolve offset via formatter round-trip
  const asUtcGuess = new Date(Date.UTC(y, m - 1, day, hours, minutes, 0));
  const parts = lagosParts(asUtcGuess);
  const driftMinutes =
    (hours - parts.hour) * 60 +
    (minutes - parts.minute) +
    (day - parts.day) * 24 * 60;
  const corrected = new Date(asUtcGuess.getTime() + driftMinutes * 60_000);

  // Second pass for DST edge cases (Lagos has none, but keep stable)
  const parts2 = lagosParts(corrected);
  const drift2 =
    (hours - parts2.hour) * 60 +
    (minutes - parts2.minute) +
    (day - parts2.day) * 24 * 60;
  const final = new Date(corrected.getTime() + drift2 * 60_000);

  void pad;
  return final.toISOString();
}

/** Extract date + time parts in Lagos for admin form fields. */
export function lagosDateAndTimeFromIso(iso?: string | null): {
  date?: Date;
  time?: { hours: number; minutes: number };
} {
  if (!iso) return {};
  try {
    const p = lagosParts(iso);
    // Use a local Date that holds the Lagos calendar day for the DatePicker
    const date = new Date(p.year, p.month - 1, p.day, 12, 0, 0);
    return { date, time: { hours: p.hour, minutes: p.minute } };
  } catch {
    return {};
  }
}
