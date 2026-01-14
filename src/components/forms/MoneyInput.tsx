/**
 * MoneyInput
 *
 * Reusable currency + amount input with:
 * - Currency selector
 * - Friendly formatting (Intl.NumberFormat)
 * - Safe typing experience (keeps a raw string while editing)
 *
 * Notes:
 * - Many backend models store only the numeric value (no currency column). This component
 *   still lets UI pick currency for display/entry, but consumers decide what to persist.
 */

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type MoneyCurrency = "NGN" | "USD" | "EUR" | "GBP";

export interface MoneyInputProps {
  /** Current numeric value (minor units are NOT used here; this is the major unit value). */
  value: number | null;
  /** Called when value changes (null means empty). */
  onValueChange: (value: number | null) => void;

  /** Selected currency code. */
  currency: MoneyCurrency;
  /** Called when currency changes. */
  onCurrencyChange: (currency: MoneyCurrency) => void;

  /** Optional list of allowed currencies. */
  currencies?: MoneyCurrency[];

  /** Placeholder for the amount input. */
  placeholder?: string;
  /** Disable both selector and input. */
  disabled?: boolean;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parse user input into a number.
 * Allows commas/spaces and ignores currency symbols.
 */
function parseMoneyInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

export default function MoneyInput({
  value,
  onValueChange,
  currency,
  onCurrencyChange,
  currencies = ["NGN", "USD", "EUR", "GBP"],
  placeholder = "0.00",
  disabled,
}: MoneyInputProps) {
  // Keep a raw string while the user types (better UX than forcing formatting on every keystroke).
  const [raw, setRaw] = useState<string>(value === null || value === undefined ? "" : String(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync raw string when parent value changes (but do not fight user typing).
  useEffect(() => {
    if (isFocused) return;
    // Avoid synchronous setState inside an effect body (repo lint rule).
    const t = window.setTimeout(() => {
      setRaw(value === null || value === undefined ? "" : String(value));
    }, 0);
    return () => window.clearTimeout(t);
  }, [value, isFocused]);

  const formattedPreview = useMemo(() => {
    if (value === null || value === undefined) return "";
    return formatMoney(value, currency);
  }, [value, currency]);

  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
      <Select value={currency} onValueChange={(v) => onCurrencyChange(v as MoneyCurrency)} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-1">
        <Input
          inputMode="decimal"
          value={raw}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            const n = parseMoneyInput(raw);
            onValueChange(n);
            // On blur, normalize display to a simple number string (keeps it editable).
            setRaw(n === null ? "" : String(n));
          }}
          onChange={(e) => {
            const next = e.target.value;
            setRaw(next);
            onValueChange(parseMoneyInput(next));
          }}
          placeholder={placeholder}
          disabled={disabled}
        />
        {formattedPreview ? <p className="text-xs text-muted-foreground">{formattedPreview}</p> : null}
      </div>
    </div>
  );
}


