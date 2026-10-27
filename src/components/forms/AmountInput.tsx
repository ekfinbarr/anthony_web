import { useState } from "react";
import { cn } from "@/lib/utils";
import { SYMBOLS, formatAmountNumber, formatAmountTyping, parseAmount } from "@/lib/amount";

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

  // Re-format from `value` when it changes or the field loses focus (adjusted during
  // render, not in an effect). While focused, the visitor's typing is left alone.
  const [synced, setSynced] = useState({ value, focused });
  if (synced.value !== value || synced.focused !== focused) {
    setSynced({ value, focused });
    if (!focused) setRaw(value === null || Number.isNaN(value) ? "" : formatAmountNumber(value));
  }

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
