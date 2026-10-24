import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SYMBOLS: Record<string, string> = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };

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

export interface AmountInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  currency?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

/**
 * Amount field. The box shows thousands separators and two decimals.
 * onValueChange receives the plain number, with commas removed.
 */
export function AmountInput({
  value,
  onValueChange,
  currency = "NGN",
  id,
  disabled,
  placeholder = "0.00",
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}: AmountInputProps) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value === null ? "" : formatAmountNumber(value));
  const symbol = SYMBOLS[currency] ?? currency;

  useEffect(() => {
    if (focused) return;
    setRaw(value === null || Number.isNaN(value) ? "" : formatAmountNumber(value));
  }, [value, focused]);

  return (
    <div
      className={cn(
        "flex min-h-11 items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        ariaInvalid && "border-destructive",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className="pl-3 text-sm text-muted-foreground" aria-hidden>{symbol}</span>
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        aria-required={ariaRequired || undefined}
        className="h-11 w-full bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground md:text-sm"
        value={focused ? raw : value === null || Number.isNaN(value) ? "" : formatAmountNumber(value)}
        onFocus={() => {
          setFocused(true);
          setRaw(value === null || Number.isNaN(value) ? "" : formatAmountTyping(String(value)));
        }}
        onChange={(event) => {
          const next = formatAmountTyping(event.target.value);
          setRaw(next);
          onValueChange(parseAmount(next));
        }}
        onBlur={() => {
          setFocused(false);
          const next = parseAmount(raw);
          onValueChange(next);
          setRaw(next === null ? "" : formatAmountNumber(next));
        }}
      />
    </div>
  );
}

export default AmountInput;
