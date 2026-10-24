import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * DatePicker Component
 * 
 * A reusable date picker component that displays a calendar in a popover.
 * Built on top of react-day-picker and styled with shadcn/ui components.
 * 
 * @example
 * ```tsx
 * const [date, setDate] = React.useState<Date>();
 * 
 * <DatePicker
 *   date={date}
 *   onDateChange={setDate}
 *   placeholder="Select a date"
 * />
 * ```
 */
export interface DatePickerProps {
  /**
   * The selected date value
   */
  date?: Date;
  
  /**
   * Callback function when date changes
   */
  onDateChange: (date: Date | undefined) => void;
  
  /**
   * Placeholder text to display when no date is selected
   * @default "Pick a date"
   */
  placeholder?: string;
  
  /**
   * Whether the date picker is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Function to determine if a date should be disabled
   * @param date - The date to check
   * @returns true if the date should be disabled
   */
  disabledDates?: (date: Date) => boolean;
  
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  
  /**
   * Date format string (using date-fns format)
   * @default "PPP" (e.g., "January 1, 2024")
   */
  dateFormat?: string;

  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

/**
 * DatePicker Component
 * 
 * A beautiful, accessible date picker with calendar popover.
 * Supports date validation, disabled dates, and custom formatting.
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  disabledDates,
  minDate,
  maxDate,
  dateFormat = "PPP",
  id,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  "aria-required": ariaRequired,
}, ref) {
  // Validate that the date is a valid Date object
  const isValidDate = React.useMemo(() => {
    if (!date) return false;
    return date instanceof Date && !isNaN(date.getTime());
  }, [date]);

  // Validate minDate and maxDate are valid Date objects
  const isValidMinDate = React.useMemo(() => {
    if (!minDate) return false;
    return minDate instanceof Date && !isNaN(minDate.getTime());
  }, [minDate]);

  const isValidMaxDate = React.useMemo(() => {
    if (!maxDate) return false;
    return maxDate instanceof Date && !isNaN(maxDate.getTime());
  }, [maxDate]);

  // Combined disabled function that checks both custom disabledDates and min/max dates
  const isDateDisabled = React.useCallback(
    (dateToCheck: Date) => {
      const day = new Date(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()).getTime();
      if (isValidMinDate) {
        const min = new Date(minDate!.getFullYear(), minDate!.getMonth(), minDate!.getDate()).getTime();
        if (day < min) return true;
      }
      if (isValidMaxDate) {
        const max = new Date(maxDate!.getFullYear(), maxDate!.getMonth(), maxDate!.getDate()).getTime();
        if (day > max) return true;
      }
      if (disabledDates) {
        return disabledDates(dateToCheck);
      }
      return false;
    },
    [minDate, maxDate, isValidMinDate, isValidMaxDate, disabledDates]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          id={id}
          type="button"
          variant="outline"
          aria-invalid={ariaInvalid || undefined}
          aria-describedby={ariaDescribedBy}
          aria-required={ariaRequired || undefined}
          className={cn(
            "min-h-11 w-full justify-start text-left font-normal",
            !isValidDate && "text-muted-foreground",
            ariaInvalid && "border-destructive",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate ? format(date!, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={onDateChange}
          disabled={isDateDisabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
});

function parseIsoDate(value?: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export interface IsoDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

/** Calendar picker for forms that store a date as YYYY-MM-DD. */
export const IsoDatePicker = React.forwardRef<HTMLButtonElement, IsoDatePickerProps>(function IsoDatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  ...rest
}, ref) {
  return (
    <DatePicker
      ref={ref}
      date={parseIsoDate(value)}
      minDate={parseIsoDate(min)}
      maxDate={parseIsoDate(max)}
      placeholder={placeholder}
      onDateChange={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
      {...rest}
    />
  );
});

