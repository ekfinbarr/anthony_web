import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        root: "relative",
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "space-y-3",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "flex items-center gap-1 text-sm font-medium",
        dropdowns: "relative z-10 flex items-center gap-2",
        dropdown_root: "relative inline-flex h-8 items-center rounded-md border border-input bg-background px-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
        dropdown: "absolute inset-0 w-full cursor-pointer opacity-0",
        nav: "absolute inset-x-0 top-0 flex h-9 items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "outline", size: "icon" }), "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"),
        button_next: cn(buttonVariants({ variant: "outline", size: "icon" }), "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100"),
        month_grid: "border-collapse",
        weekday: "h-9 w-9 text-center text-[0.8rem] font-normal text-muted-foreground",
        day: "h-9 w-9 p-0 text-center align-middle",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal"),
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-40",
        hidden: "invisible",
        range_start: "rounded-l-md bg-accent",
        range_middle: "bg-accent",
        range_end: "rounded-r-md bg-accent",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName }) => {
          if (orientation === "right") return <ChevronRight className={cn("h-4 w-4", iconClassName)} />;
          if (orientation === "down") return <ChevronRight className={cn("h-4 w-4 rotate-90", iconClassName)} />;
          return <ChevronLeft className={cn("h-4 w-4", iconClassName)} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
