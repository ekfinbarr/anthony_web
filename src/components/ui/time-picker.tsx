import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * TimePicker Component
 * 
 * A reusable time picker component that displays hour and minute selectors in a popover.
 * Provides 12-hour or 24-hour format options.
 * 
 * @example
 * ```tsx
 * const [time, setTime] = React.useState({ hours: 14, minutes: 30 });
 * 
 * <TimePicker
 *   time={time}
 *   onTimeChange={setTime}
 *   format="24h"
 * />
 * ```
 */
export interface TimePickerProps {
  /**
   * The selected time value in format { hours: number, minutes: number }
   * Hours: 0-23 for 24h format, 1-12 for 12h format
   */
  time?: { hours: number; minutes: number };
  
  /**
   * Callback function when time changes
   */
  onTimeChange: (time: { hours: number; minutes: number } | undefined) => void;
  
  /**
   * Time format: "12h" (AM/PM) or "24h"
   * @default "24h"
   */
  format?: "12h" | "24h";
  
  /**
   * Placeholder text to display when no time is selected
   * @default "Select time"
   */
  placeholder?: string;
  
  /**
   * Whether the time picker is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Optional className for custom styling
   */
  className?: string;
  
  /**
   * Interval between minutes (e.g., 5 for 00, 05, 10, 15...)
   * @default 1
   */
  minuteInterval?: number;
}

/**
 * TimePicker Component
 * 
 * A beautiful, accessible time picker with hour and minute selection.
 * Supports both 12-hour (AM/PM) and 24-hour formats.
 */
export function TimePicker({
  time,
  onTimeChange,
  format = "24h",
  placeholder = "Select time",
  disabled = false,
  className,
  minuteInterval = 1,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Helper function to convert 24h hours to 12h format for display
  const convertTo12Hour = React.useCallback((hours: number): number => {
    if (format === "12h") {
      if (hours === 0) return 12;
      if (hours > 12) return hours - 12;
      return hours;
    }
    return hours;
  }, [format]);

  // Initialize state with proper conversion
  const getInitialHours = (): number => {
    if (time) {
      return convertTo12Hour(time.hours);
    }
    return format === "12h" ? 12 : 0;
  };

  const [tempHours, setTempHours] = React.useState(getInitialHours());
  const [tempMinutes, setTempMinutes] = React.useState(time?.minutes ?? 0);
  const [amPm, setAmPm] = React.useState<"AM" | "PM">(
    time && time.hours >= 12 ? "PM" : "AM"
  );

  // Initialize temp values when time changes externally
  React.useEffect(() => {
    if (time) {
      const initialHours = convertTo12Hour(time.hours);
      setTempHours(initialHours);
      setTempMinutes(time.minutes);
      if (format === "12h") {
        setAmPm(time.hours >= 12 ? "PM" : "AM");
      }
    } else {
      // Reset to defaults when time is cleared
      setTempHours(format === "12h" ? 12 : 0);
      setTempMinutes(0);
      setAmPm("AM");
    }
  }, [time, format, convertTo12Hour]);

  // Generate hour options based on format
  const hourOptions = React.useMemo(() => {
    if (format === "12h") {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
    return Array.from({ length: 24 }, (_, i) => i);
  }, [format]);

  // Generate minute options based on interval
  const minuteOptions = React.useMemo(() => {
    return Array.from({ length: 60 / minuteInterval }, (_, i) => i * minuteInterval);
  }, [minuteInterval]);

  // Format time for display
  const formatTime = React.useCallback(
    (hours: number, minutes: number): string => {
      if (format === "12h") {
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const displayAmPm = hours >= 12 ? "PM" : "AM";
        return `${displayHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${displayAmPm}`;
      }
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    },
    [format]
  );

  // Handle hour selection
  const handleHourSelect = React.useCallback(
    (hour: number) => {
      setTempHours(hour);
    },
    []
  );

  // Handle minute selection
  const handleMinuteSelect = React.useCallback(
    (minute: number) => {
      setTempMinutes(minute);
    },
    []
  );

  // Handle confirm
  const handleConfirm = React.useCallback(() => {
    let finalHours = tempHours;
    
    // Convert 12h format to 24h format for storage
    if (format === "12h") {
      if (amPm === "PM" && tempHours !== 12) {
        finalHours = tempHours + 12;
      } else if (amPm === "AM" && tempHours === 12) {
        finalHours = 0;
      }
    }
    
    onTimeChange({ hours: finalHours, minutes: tempMinutes });
    setIsOpen(false);
  }, [tempHours, tempMinutes, amPm, format, onTimeChange]);

  // Handle cancel
  const handleCancel = React.useCallback(() => {
    // Reset to original values
    if (time) {
      setTempHours(time.hours);
      setTempMinutes(time.minutes);
      if (format === "12h") {
        setAmPm(time.hours >= 12 ? "PM" : "AM");
      }
    }
    setIsOpen(false);
  }, [time, format]);

  // Convert 24h to 12h for display
  const displayHours = React.useMemo(() => {
    if (format === "12h") {
      if (tempHours === 0) return 12;
      if (tempHours > 12) return tempHours - 12;
      return tempHours;
    }
    return tempHours;
  }, [tempHours, format]);

  // Display time string
  const displayTime = time
    ? formatTime(
        format === "12h" && time.hours > 12 ? time.hours - 12 : format === "12h" && time.hours === 0 ? 12 : time.hours,
        time.minutes
      )
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          <span>{displayTime}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex items-center gap-2">
            {/* Hours Selector */}
            <ScrollArea className="h-64 w-16">
              <div className="flex flex-col gap-1">
                {hourOptions.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourSelect(hour)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      displayHours === hour
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground"
                    )}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </ScrollArea>

            <span className="text-lg font-medium">:</span>

            {/* Minutes Selector */}
            <ScrollArea className="h-64 w-16">
              <div className="flex flex-col gap-1">
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteSelect(minute)}
                    className={cn(
                      "px-3 py-2 text-sm rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      tempMinutes === minute
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-foreground"
                    )}
                  >
                    {minute.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </ScrollArea>

            {/* AM/PM Selector (only for 12h format) */}
            {format === "12h" && (
              <>
                <div className="w-px h-64 bg-border mx-2" />
                <ScrollArea className="h-64 w-12">
                  <div className="flex flex-col gap-1">
                    {(["AM", "PM"] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setAmPm(period)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-md transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          amPm === period
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground"
                        )}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

