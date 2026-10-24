import { useMemo } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BulletinCalendarPanelProps = {
  publishedDates: string[];
  selectedDate?: string | null;
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelectDate: (isoDate: string | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
};

const BulletinCalendarPanel = ({
  publishedDates,
  selectedDate,
  month,
  onMonthChange,
  onSelectDate,
  open,
  onOpenChange,
  className,
}: BulletinCalendarPanelProps) => {
  const dateSet = useMemo(() => new Set(publishedDates), [publishedDates]);

  const selected = selectedDate ? parseISO(selectedDate) : undefined;

  const modifiers = useMemo(
    () => ({
      hasBulletin: (day: Date) => dateSet.has(format(day, "yyyy-MM-dd")),
    }),
    [dateSet],
  );

  return (
    <div className={cn("w-full", className)}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start border-church-gold-warm/30 sm:w-auto"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-controls="bulletin-calendar-panel"
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-church-gold-warm" aria-hidden="true" />
        Browse by Date
      </Button>

      {open && (
        <div
          id="bulletin-calendar-panel"
          className="mt-3 overflow-x-auto rounded-xl border border-church-gold-warm/20 bg-white p-2 shadow-sm"
          role="region"
          aria-label="Bulletin publication calendar"
        >
          <Calendar
            mode="single"
            month={month}
            onMonthChange={onMonthChange}
            selected={selected}
            onSelect={(day) => {
              if (!day) {
                onSelectDate(null);
                return;
              }
              const iso = format(day, "yyyy-MM-dd");
              if (!dateSet.has(iso)) return;
              onSelectDate(iso);
            }}
            modifiers={modifiers}
            modifiersClassNames={{
              hasBulletin:
                "[&>button]:font-semibold [&>button]:text-church-gold-warm [&>button]:underline [&>button]:underline-offset-4",
            }}
            disabled={(day) => !dateSet.has(format(day, "yyyy-MM-dd"))}
            className="mx-auto"
          />
          <p className="px-3 pb-2 text-xs text-muted-foreground">
            Highlighted dates have a published Sunday bulletin. Only those dates can be selected.
          </p>
          {selectedDate && (
            <div className="flex justify-end px-3 pb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectDate(null);
                  onMonthChange(startOfMonth(new Date()));
                }}
              >
                Clear date
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulletinCalendarPanel;
