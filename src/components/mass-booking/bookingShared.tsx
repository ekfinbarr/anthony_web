/**
 * Form pieces shared by the public Mass booking wizard and the admin (office) booking form.
 */

import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FieldHint from "@/components/forms/FieldHint";
import { IsoDatePicker } from "@/components/ui/date-picker";
import type { BookingOptions } from "@/services/massBookingOrder.service";
import { addDays, formatTime, schedulesFor, todayIso, type IntentionDraft } from "@/components/mass-booking/bookingHelpers";

export const Field = ({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) => {
  const id = useId();
  const errorId = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean }>, {
      id,
      "aria-invalid": Boolean(error) || undefined,
      "aria-describedby": error ? errorId : undefined,
      "aria-required": required || undefined,
    })
    : children;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>
          {label}
          {required ? <span className="text-destructive" aria-hidden="true"> *</span> : null}
        </Label>
        {hint ? <FieldHint text={hint} /> : null}
      </div>
      {control}
      {error && <p id={errorId} className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
};

export interface IntentionFieldsProps {
  item: IntentionDraft;
  index: number;
  options: BookingOptions | null;
  errors: Record<string, string>;
  onChange: (patch: Partial<IntentionDraft>) => void;
  onRemove?: () => void;
  /** Rename beneficiary choices for the context, e.g. "Myself" → "The person booking". */
  beneficiaryLabel?: (value: string, label: string) => string;
  hints?: { beneficiary?: string };
  className?: string;
}

/** One Mass in a booking: intentions, who it is for, date and Mass, notes. */
export function IntentionFields({ item, index, options, errors, onChange, onRemove, beneficiaryLabel, hints, className }: IntentionFieldsProps) {
  const masses = schedulesFor(options, item.date);
  const prefix = `intention-${item.id}`;
  return (
    <fieldset className={className ?? "space-y-4 rounded-lg border p-4"}>
      <legend className="px-1 text-sm font-medium">Mass {index + 1}</legend>
      <Field label="Intentions" required error={errors[`${prefix}-category`]} hint="Choose every intention for this Mass.">
        <MultiSelect
          options={options?.categories ?? []}
          value={item.categories}
          onValueChange={(categories) => onChange({ categories })}
          placeholder="Choose intentions"
          searchPlaceholder="Search intentions"
          className="min-h-11"
        />
      </Field>
      <Field label="Offered for" required error={errors[`${prefix}-beneficiary`]} hint={hints?.beneficiary ?? "You, another person, or a family."}>
        <Select value={item.beneficiaryType} onValueChange={(value) => onChange({ beneficiaryType: value })}>
          <SelectTrigger><SelectValue placeholder="Who is this for?" /></SelectTrigger>
          <SelectContent>
            {options?.beneficiaries.map((beneficiary) => (
              <SelectItem key={beneficiary.value} value={beneficiary.value}>
                {beneficiaryLabel ? beneficiaryLabel(beneficiary.value, beneficiary.label) : beneficiary.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {item.beneficiaryType && item.beneficiaryType !== "myself" && (
        <Field
          label={item.beneficiaryType === "family_or_group" ? "Family or group" : "Name"}
          required
          error={errors[`${prefix}-name`]}
          hint="The name the priest should read."
        >
          <Input value={item.beneficiaryName} onChange={(event) => onChange({ beneficiaryName: event.target.value })} />
        </Field>
      )}
      <Field label="Date" required error={errors[`${prefix}-date`]} hint="Today or a later day in the booking period.">
        <IsoDatePicker
          value={item.date}
          min={todayIso()}
          max={options?.horizon_days ? addDays(todayIso(), options.horizon_days) : undefined}
          onChange={(value) => onChange({ date: value, scheduleId: "" })}
        />
      </Field>
      <Field label="Mass" required error={errors[`${prefix}-mass`]} hint="Choose the date first, then the time.">
        <Select value={item.scheduleId} onValueChange={(value) => onChange({ scheduleId: value })} disabled={!item.date || masses.length === 0}>
          <SelectTrigger><SelectValue placeholder={item.date ? "Choose a Mass" : "Choose a date first"} /></SelectTrigger>
          <SelectContent>
            {masses.map((mass) => (
              <SelectItem key={mass.id} value={mass.id}>
                {mass.title} {formatTime(mass.start_time)} {mass.language ? `(${mass.language})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Notes" hint="Optional. Anything else for the office.">
        <Textarea value={item.notes} maxLength={2000} onChange={(event) => onChange({ notes: event.target.value })} />
      </Field>
      {onRemove && (
        <Button type="button" variant="outline" className="min-h-11 border-2 border-destructive text-destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Remove this Mass
        </Button>
      )}
    </fieldset>
  );
}
