/**
 * Rules shared by the public Mass booking wizard and the admin (office)
 * booking form, so both treat each Mass intention the same way.
 */

import type { BookingOptions, MassOption } from "@/services/massBookingOrder.service";

export const MAX_INTENTIONS = 12;

export type IntentionDraft = {
  id: string;
  categories: string[];
  beneficiaryType: string;
  beneficiaryName: string;
  date: string;
  scheduleId: string;
  notes: string;
};

export const emptyIntention = (): IntentionDraft => ({
  id: crypto.randomUUID(),
  categories: [],
  beneficiaryType: "",
  beneficiaryName: "",
  date: "",
  scheduleId: "",
  notes: "",
});

export const normalizeIntention = (item: Partial<IntentionDraft> & { category?: string }): IntentionDraft => {
  const legacy = item.category ? [item.category] : [];
  const categories = Array.isArray(item.categories) ? item.categories.filter(Boolean) : legacy;
  return {
    id: item.id || crypto.randomUUID(),
    categories,
    beneficiaryType: item.beneficiaryType || "",
    beneficiaryName: item.beneficiaryName || "",
    date: item.date || "",
    scheduleId: item.scheduleId || "",
    notes: item.notes || "",
  };
};

export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

export function formatTime(value?: string | null) {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute || 0));
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function schedulesFor(options: BookingOptions | null, date: string): MassOption[] {
  if (!options || !date) return [];
  const day = weekday(date);
  return options.schedules.filter((schedule) => schedule.day_of_week.toLowerCase() === day);
}

export const labelFor = (list: { value: string; label: string }[] | undefined, value: string) =>
  list?.find((item) => item.value === value)?.label || value;

/** Field errors keyed `intention-<id>-<field>`, matching IntentionFields. */
export function validateIntentions(intentions: IntentionDraft[], options: BookingOptions | null): Record<string, string> {
  const errors: Record<string, string> = {};
  intentions.forEach((item, index) => {
    const prefix = `intention-${item.id}`;
    if (item.categories.length === 0) errors[`${prefix}-category`] = "Choose at least one intention.";
    if (!item.beneficiaryType) errors[`${prefix}-beneficiary`] = "Say who this Mass is for.";
    if (item.beneficiaryType !== "myself" && item.beneficiaryName.trim().length < 2) {
      errors[`${prefix}-name`] = "Enter the person's or family's name.";
    }
    if (!item.date) errors[`${prefix}-date`] = "Choose a date.";
    if (item.date && item.date < todayIso()) errors[`${prefix}-date`] = "Choose today or a future date.";
    if (options?.horizon_days && item.date > addDays(todayIso(), options.horizon_days)) {
      errors[`${prefix}-date`] = `Bookings can be made up to ${options.horizon_days} days ahead.`;
    }
    const masses = schedulesFor(options, item.date);
    if (item.date && masses.length === 0) errors[`${prefix}-mass`] = "No Mass is scheduled that day.";
    if (item.date && masses.length > 0 && !masses.some((mass) => mass.id === item.scheduleId)) {
      errors[`${prefix}-mass`] = "Choose a Mass celebrated on that day.";
    }
    if (!errors[`${prefix}-category`] && item.categories.length === 0) errors[`${prefix}-category`] = `Mass ${index + 1} needs an intention.`;
  });
  return errors;
}

/** The same Mass one week later, or an error when that is past the booking period. */
export function duplicateIntention(
  source: IntentionDraft | undefined,
  options: BookingOptions | null
): { item: IntentionDraft } | { error: string } | null {
  if (!source?.date || !source.scheduleId) return null;
  const nextDate = addDays(source.date, 7);
  if (options?.horizon_days && nextDate > addDays(todayIso(), options.horizon_days)) {
    return { error: "No later date is open for that Mass." };
  }
  return { item: { ...source, id: crypto.randomUUID(), date: nextDate } };
}

const BOOKING_FIELD_LABELS: Record<string, string> = {
  intention_categories: "intentions",
  intention_category: "intentions",
  booking_date: "date",
  mass_schedule_id: "time",
  beneficiary_type: "offered for",
  beneficiary_name: "name",
  notes: "notes",
  amount: "Offering",
  name: "Full name",
  phone: "Phone number",
  email: "Email address",
  payment_method: "Payment method",
  transfer_reference: "Transfer reference",
  transfer_date: "Transfer date",
  evidence: "Proof of payment",
  user_id: "Parishioner",
  paid_on: "Date received",
};

function bookingFieldLabel(key: string): string {
  const mass = key.match(/^intentions\.(\d+)\.([a-z_]+)/);
  if (mass) {
    const number = Number(mass[1]) + 1;
    const name = BOOKING_FIELD_LABELS[mass[2]] ?? mass[2].replaceAll("_", " ");
    return `Mass ${number} ${name}`;
  }
  return BOOKING_FIELD_LABELS[key] ?? key.replaceAll("_", " ");
}

function readableBookingError(key: string, message: string): string {
  const label = bookingFieldLabel(key);
  const stripped = message.replace(/^The .+? field/i, label);
  if (stripped !== message) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return `${label}: ${message}`;
}

export function bookingErrorLines(caught: unknown): string[] {
  const data = caught && typeof caught === "object" && "data" in caught
    ? (caught as { data?: unknown }).data
    : undefined;
  if (data && typeof data === "object" && data !== null && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (errors && typeof errors === "object") {
      const lines = Object.entries(errors as Record<string, unknown>).flatMap(([key, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages
          .filter((item): item is string => typeof item === "string" && item.trim() !== "")
          .map((message) => readableBookingError(key, message));
      });
      if (lines.length > 0) return lines;
    }
  }
  if (caught instanceof Error && caught.message) return [caught.message];
  return ["The booking could not be submitted. Your entries are still here."];
}
