/**
 * Colour context for Mass booking statuses, shared by the Orders list,
 * the review dialog and the Kanban board so a status always looks the same.
 *
 * Class names are written out in full so Tailwind keeps them in the build.
 */

export type StatusTone = "amber" | "emerald" | "rose" | "slate" | "sky" | "violet";

export const TONE_BADGE: Record<StatusTone, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
  sky: "border-sky-200 bg-sky-50 text-sky-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
};

export const TONE_DOT: Record<StatusTone, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
};

export const TONE_BORDER_L: Record<StatusTone, string> = {
  amber: "border-l-amber-400",
  emerald: "border-l-emerald-500",
  rose: "border-l-rose-400",
  slate: "border-l-slate-400",
  sky: "border-l-sky-400",
  violet: "border-l-violet-400",
};

type StatusMeta = { label: string; tone: StatusTone };

const BOOKING_STATUS: Record<string, StatusMeta> = {
  pending: { label: "Requested", tone: "amber" },
  approved: { label: "Approved", tone: "emerald" },
  alternative_required: { label: "Needs new time", tone: "violet" },
  rejected: { label: "Rejected", tone: "rose" },
  cancelled: { label: "Cancelled", tone: "slate" },
};

const PAYMENT_STATUS: Record<string, StatusMeta> = {
  pending: { label: "Unpaid", tone: "amber" },
  awaiting_verification: { label: "Awaiting verification", tone: "sky" },
  paid: { label: "Paid", tone: "emerald" },
  failed: { label: "Payment failed", tone: "rose" },
  rejected: { label: "Payment rejected", tone: "rose" },
};

const humanize = (value: string) => value.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());

export function bookingStatusMeta(status: string): StatusMeta {
  return BOOKING_STATUS[status] ?? { label: humanize(status), tone: "slate" };
}

export function paymentStatusMeta(status: string): StatusMeta {
  return PAYMENT_STATUS[status] ?? { label: humanize(status), tone: "slate" };
}

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  flutterwave: "Online (Flutterwave)",
  cash: "Cash at the office",
  bank_transfer: "Bank transfer",
};
