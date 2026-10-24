/**
 * Parish schedule — the single source of truth for Mass times and other parish
 * observances shown on the Visit page, About page, footer, FAQ and chatbot.
 *
 * The weekly Mass schedule below is taken from the Visit ("Plan Your Visit") page.
 * Please have the parish office confirm these times; once confirmed, update this
 * file only — every page that shows times reads from here.
 */

export type DayOfWeek =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type MassScheduleGroupId = "sunday" | "weekdays" | "saturdays" | "public-holidays";

export interface MassTime {
  /** 24-hour local time, "HH:mm". */
  time: string;
  label: string;
}

export interface MassDay {
  day: DayOfWeek;
  masses: MassTime[];
}

/** Display groups used by the Visit page Mass schedule list. */
export interface MassScheduleGroup {
  id: MassScheduleGroupId;
  title: string;
  /** Short range label, e.g. "Monday – Friday". */
  dayRange: string;
  description: string;
  /** Highlight the principal Sunday celebration. */
  recommended?: boolean;
  masses: MassTime[];
}

export interface ParishService {
  name: string;
  day: DayOfWeek;
  time: string;
}

export const massSchedule: MassDay[] = [
  {
    day: "Sunday",
    masses: [
      { time: "07:00", label: "Church (English)" },
      { time: "08:30", label: "Church & Downstairs (English)" },
      { time: "10:00", label: "Church (Yoruba)" },
      { time: "11:30", label: "Church (Latin)" },
      { time: "18:00", label: "Church (English)" },
    ],
  },
  {
    day: "Monday", masses: [
      { time: "06:30", label: "Morning Mass" },
      { time: "12:30", label: "Midday Mass" },
      { time: "18:30", label: "Evening Mass" },
    ]
  },
  {
    day: "Tuesday", masses: [
      { time: "06:30", label: "Morning Mass" },
      { time: "12:30", label: "Midday Mass" },
    ]
  },
  {
    day: "Wednesday", masses: [
      { time: "06:30", label: "Morning Mass" },
      { time: "12:30", label: "Midday Mass" },
      { time: "18:30", label: "Evening Mass" },
    ]
  },
  {
    day: "Thursday", masses: [
      { time: "06:30", label: "Morning Mass" },
      { time: "12:30", label: "Midday Mass" },
      { time: "18:30", label: "Evening Mass" },
    ]
  },
  {
    day: "Friday", masses: [
      { time: "06:30", label: "Morning Mass" },
      { time: "12:30", label: "Midday Mass" },
      { time: "18:30", label: "Evening Mass" },
    ]
  },
  {
    day: "Saturday", masses: [{ time: "07:00", label: "Morning Mass" }]
  },
];

/** Public-holiday Masses (not tied to a weekday). */
export const publicHolidayMasses: MassTime[] = [
  { time: "08:00", label: "Morning Mass" },
];

const WEEKDAY_DAYS: DayOfWeek[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/** Other regular parish observances previously listed in the site footer. */
export const otherServices: ParishService[] = [
  { name: "Faith & Doctrinal Class", day: "Thursday", time: "19:00" },
  { name: "Confessions", day: "Saturday", time: "07:45" },
];

/** "07:00" → "7:00 AM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** Joins a list as "a, b & c". */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

export function getMassDay(day: DayOfWeek): MassDay | undefined {
  return massSchedule.find((entry) => entry.day === day);
}

/** "7:00 AM, 8:30 AM & 5:00 PM" */
export function formatMassTimes(day: DayOfWeek): string {
  return joinList((getMassDay(day)?.masses ?? []).map((mass) => formatTime(mass.time)));
}

/**
 * Groups weekdays (Mon–Fri) that share identical Mass times, e.g.
 * [{ days: "Tuesday – Friday", times: "6:30 AM" }].
 * Saturday is listed separately on the Visit schedule.
 */
export function weekdayMassSummary(): Array<{ days: string; times: string }> {
  const weekdays = massSchedule.filter((entry) => WEEKDAY_DAYS.includes(entry.day));
  const groups: Array<{ days: DayOfWeek[]; times: string }> = [];
  for (const entry of weekdays) {
    const times = joinList(entry.masses.map((mass) => formatTime(mass.time)));
    const last = groups[groups.length - 1];
    if (last && last.times === times) last.days.push(entry.day);
    else groups.push({ days: [entry.day], times });
  }
  return groups.map((group) => ({
    days: group.days.length > 1 ? `${group.days[0]} – ${group.days[group.days.length - 1]}` : group.days[0],
    times: group.times,
  }));
}

/** Unique Mass times shared across Mon–Fri entries (for Visit list cards). */
function weekdayMassTimes(): MassTime[] {
  const weekdays = massSchedule.filter((entry) => WEEKDAY_DAYS.includes(entry.day));
  if (weekdays.length === 0) return [];
  const signature = (masses: MassTime[]) =>
    masses.map((mass) => `${mass.time}|${mass.label}`).join(";");
  const firstSig = signature(weekdays[0].masses);
  const allMatch = weekdays.every((entry) => signature(entry.masses) === firstSig);
  if (allMatch) return weekdays[0].masses;
  // Fallback: flatten unique times if weekdays diverge.
  const seen = new Set<string>();
  const times: MassTime[] = [];
  for (const entry of weekdays) {
    for (const mass of entry.masses) {
      const key = `${mass.time}|${mass.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        times.push(mass);
      }
    }
  }
  return times;
}

/**
 * Visit-page groups: Sunday, Weekdays, Saturdays, Public Holidays.
 * Prefer this over raw `massSchedule` when rendering the schedule list.
 */
export function getMassScheduleGroups(): MassScheduleGroup[] {
  const sunday = getMassDay("Sunday")?.masses ?? [];
  const saturday = getMassDay("Saturday")?.masses ?? [];
  const weekdaySummary = weekdayMassSummary();
  const weekdayRange =
    weekdaySummary.length === 1
      ? weekdaySummary[0].days
      : weekdaySummary.map((group) => group.days).join(", ") || "Weekdays";

  return [
    {
      id: "sunday",
      title: "Sunday",
      dayRange: "Every Sunday",
      description: "Our principal celebration of the Eucharist",
      recommended: false,
      masses: sunday,
    },
    {
      id: "weekdays",
      title: "Weekdays",
      dayRange: weekdayRange,
      description: "Daily Mass through the working week",
      masses: weekdayMassTimes(),
    },
    {
      id: "saturdays",
      title: "Saturdays",
      dayRange: "Every Saturday",
      description: "Saturday morning Mass",
      masses: saturday,
    },
    {
      id: "public-holidays",
      title: "Public Holidays",
      dayRange: "Public holidays",
      description: "Mass on national and church public holidays",
      masses: publicHolidayMasses,
    },
  ];
}

/** One-sentence answer to "What are the Mass times?" */
export function massTimesAnswer(): string {
  const weekday = weekdayMassSummary()
    .map((group) => `${group.days} at ${group.times}`)
    .join("; ");
  const saturday = formatMassTimes("Saturday");
  const holidays = joinList(publicHolidayMasses.map((mass) => formatTime(mass.time)));
  return `Sunday Masses are celebrated at ${formatMassTimes("Sunday")}. Weekday Mass is held ${weekday}. Saturday Mass is at ${saturday}. Public holiday Mass is at ${holidays}.`;
}

export function formatService(service: ParishService): string {
  return `${service.day} at ${formatTime(service.time)}`;
}
