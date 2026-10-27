import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SacramentKey, Sacraments } from "@/services/parishRegistration.service";
import {
  ANSWERS,
  MARRIAGE_ANSWERS,
  MAX_HOUSEHOLD,
  MEMBER_SACRAMENTS,
  RELATIONSHIPS,
  SACRAMENT_LABELS,
  newHouseholdMember,
  type HouseholdDraft,
  type Option,
} from "./registrationFields";

/**
 * Single choice shown as tappable pills (or cards when options have descriptions).
 * Native radios underneath, so keyboard and screen readers work as usual.
 * Tapping the selected option again clears it, because every question here is optional.
 */
export function PillChoice<T extends string>({
  name,
  legend,
  hint,
  value,
  options,
  onChange,
  srOnlyLegend = false,
}: {
  name: string;
  legend: string;
  hint?: string;
  value: T | "" | null | undefined;
  options: Option<T>[];
  onChange: (value: T | null) => void;
  srOnlyLegend?: boolean;
}) {
  const cards = options.some((option) => option.description);
  return (
    <fieldset className="space-y-2">
      <legend className={cn("text-sm font-medium leading-none", srOnlyLegend && "sr-only")}>{legend}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className={cn(cards ? "grid gap-2" : "flex flex-wrap gap-2", !srOnlyLegend && "pt-1")}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "group relative cursor-pointer border text-sm transition-[border-color,background-color,box-shadow] duration-200",
                "hover:border-church-gold/70 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1",
                cards ? "flex min-h-11 items-start gap-3 rounded-lg p-3.5" : "inline-flex min-h-10 items-center rounded-full px-4",
                checked
                  ? "border-church-gold bg-church-gold/15 text-church-charcoal shadow-[0_0_0_1px_hsl(var(--church-gold)/0.35)]"
                  : "border-input bg-background"
              )}
            >
              <input
                type="radio"
                className="sr-only"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                onClick={() => checked && onChange(null)}
              />
              {cards && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    checked ? "border-church-gold" : "border-muted-foreground/50"
                  )}
                >
                  {checked && <span className="h-2 w-2 rounded-full bg-church-gold" />}
                </span>
              )}
              <span>
                <span className={cn("block", cards && "font-medium")}>{option.label}</span>
                {option.description && <span className="mt-0.5 block text-muted-foreground">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** One row of Received / Not yet / Not sure per sacrament. */
export function SacramentRows({
  idPrefix,
  keys,
  value,
  onChange,
}: {
  idPrefix: string;
  keys: SacramentKey[];
  value: Sacraments;
  onChange: (value: Sacraments) => void;
}) {
  return (
    <div className="divide-y rounded-lg border bg-background">
      {keys.map((key) => (
        <div key={key} className="grid gap-2 px-3 py-3 sm:grid-cols-[11rem_1fr] sm:items-center">
          <span id={`${idPrefix}-${key}-label`} className="text-sm font-medium" aria-hidden="true">
            {SACRAMENT_LABELS[key]}
          </span>
          <PillChoice
            name={`${idPrefix}-${key}`}
            legend={SACRAMENT_LABELS[key]}
            srOnlyLegend
            value={value[key]}
            options={key === "marriage" ? MARRIAGE_ANSWERS : ANSWERS}
            onChange={(answer) => {
              const next = { ...value };
              if (answer) next[key] = answer;
              else delete next[key];
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** Optional people living with the applicant. They stay listed under the applicant's record. */
export function HouseholdEditor({
  members,
  onChange,
  errors,
  today,
}: {
  members: HouseholdDraft[];
  onChange: (members: HouseholdDraft[]) => void;
  errors: Record<string, string>;
  today: string;
}) {
  const update = (index: number, values: Partial<HouseholdDraft>) =>
    onChange(members.map((member, i) => (i === index ? { ...member, ...values } : member)));

  return (
    <div className="space-y-3">
      {members.map((member, index) => {
        const nameError = errors[`household.${index}.name`];
        const relationshipError = errors[`household.${index}.relationship`];
        const id = `member-${member.key}`;
        return (
          <section
            key={member.key}
            aria-labelledby={`${id}-title`}
            className="space-y-4 rounded-xl border bg-muted/30 p-4 motion-safe:animate-fade-in"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 id={`${id}-title`} className="font-medium">
                {member.name.trim() || `Household member ${index + 1}`}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="min-h-11 text-muted-foreground hover:text-destructive"
                onClick={() => onChange(members.filter((_, i) => i !== index))}
              >
                <Trash2 className="mr-1.5 h-4 w-4" aria-hidden="true" /> Remove
                <span className="sr-only"> {member.name || `household member ${index + 1}`}</span>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor={`${id}-name`}>
                  Full name<span className="text-destructive" aria-hidden="true"> *</span>
                </Label>
                <Input
                  id={`${id}-name`}
                  value={member.name}
                  aria-invalid={Boolean(nameError) || undefined}
                  aria-describedby={nameError ? `${id}-name-error` : undefined}
                  onChange={(event) => update(index, { name: event.target.value })}
                />
                {nameError && <p id={`${id}-name-error`} role="alert" className="text-sm text-destructive">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-relationship`}>
                  Relationship to you<span className="text-destructive" aria-hidden="true"> *</span>
                </Label>
                <Select
                  value={member.relationship || undefined}
                  onValueChange={(value) => update(index, { relationship: value as HouseholdDraft["relationship"] })}
                >
                  <SelectTrigger
                    id={`${id}-relationship`}
                    className="min-h-11"
                    aria-invalid={Boolean(relationshipError) || undefined}
                    aria-describedby={relationshipError ? `${id}-relationship-error` : undefined}
                  >
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {relationshipError && (
                  <p id={`${id}-relationship-error`} role="alert" className="text-sm text-destructive">{relationshipError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-dob`}>Date of birth <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <IsoDatePicker
                  id={`${id}-dob`}
                  value={member.dateOfBirth}
                  onChange={(value) => update(index, { dateOfBirth: value })}
                  min="1900-01-01"
                  max={today}
                  yearDropdown
                  placeholder="Choose a date"
                />
              </div>
            </div>
            <SacramentRows
              idPrefix={id}
              keys={MEMBER_SACRAMENTS}
              value={member.sacraments}
              onChange={(sacraments) => update(index, { sacraments })}
            />
          </section>
        );
      })}
      {members.length < MAX_HOUSEHOLD && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full border-dashed hover:border-church-gold hover:bg-church-gold/10"
          onClick={() => onChange([...members, newHouseholdMember()])}
        >
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          {members.length ? "Add another person" : "Add a household member"}
        </Button>
      )}
    </div>
  );
}
