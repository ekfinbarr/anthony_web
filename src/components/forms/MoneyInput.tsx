import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AmountInput from "@/components/forms/AmountInput";

export type MoneyCurrency = "NGN" | "USD" | "EUR" | "GBP";

export interface MoneyInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  currency: MoneyCurrency;
  onCurrencyChange: (currency: MoneyCurrency) => void;
  currencies?: MoneyCurrency[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Currency selector plus a formatted amount. The amount box shows thousands
 * separators and two decimals. The parent receives a plain number.
 */
export default function MoneyInput({
  value,
  onValueChange,
  currency,
  onCurrencyChange,
  currencies = ["NGN", "USD", "EUR", "GBP"],
  placeholder = "0.00",
  disabled,
  id,
}: MoneyInputProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
      <Select value={currency} onValueChange={(next) => onCurrencyChange(next as MoneyCurrency)} disabled={disabled}>
        <SelectTrigger className="min-h-11">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {currencies.map((code) => (
            <SelectItem key={code} value={code}>{code}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AmountInput id={id} value={value} onValueChange={onValueChange} currency={currency} placeholder={placeholder} disabled={disabled} />
    </div>
  );
}
