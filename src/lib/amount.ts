/** Parsing and formatting for money amounts typed by people (used by AmountInput). */

export const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };

export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

/** Thousands separators while the visitor is still typing. A trailing dot is kept. */
export function formatAmountTyping(raw: string): string {
  const cleaned = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const dot = cleaned.indexOf(".");
  const whole = dot === -1 ? cleaned : cleaned.slice(0, dot);
  const fraction = dot === -1 ? "" : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  const normalized = whole.replace(/^0+(?=\d)/, "");
  const grouped = (normalized || (dot === -1 ? "" : "0")).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (dot === -1) return grouped;
  return `${grouped || "0"}.${fraction}`;
}

export function formatAmountNumber(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAmount(value: number | null | undefined, currency = "NGN"): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "";
  const formatted = formatAmountNumber(Number(value));
  const symbol = SYMBOLS[currency];
  return symbol ? `${symbol}${formatted}` : `${currency} ${formatted}`;
}
