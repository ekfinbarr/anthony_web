import { CalendarDays, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type EventsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  view: "list" | "calendar";
  onViewChange: (view: "list" | "calendar") => void;
};

const EventsToolbar = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  timeframe,
  onTimeframeChange,
  view,
  onViewChange,
}: EventsToolbarProps) => {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events…"
          className="pl-9"
          aria-label="Search events"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={timeframe || "upcoming"} onValueChange={onTimeframeChange}>
          <SelectTrigger className="w-[140px]" aria-label="Date filter">
            <SelectValue placeholder="When" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="past">Past events</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort || "soonest"} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px]" aria-label="Sort events">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="soonest">Soonest first</SelectItem>
            <SelectItem value="latest">Latest scheduled</SelectItem>
            <SelectItem value="newest">Recently added</SelectItem>
          </SelectContent>
        </Select>

        <div
          role="group"
          aria-label="View mode"
          className="inline-flex border border-church-gold-warm/25"
        >
          <button
            type="button"
            aria-pressed={view === "list"}
            onClick={() => onViewChange("list")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              view === "list" ? "bg-church-gold/20 text-church-charcoal" : "bg-white text-muted-foreground hover:text-church-charcoal",
            )}
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === "calendar"}
            onClick={() => onViewChange("calendar")}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
              view === "calendar" ? "bg-church-gold/20 text-church-charcoal" : "bg-white text-muted-foreground hover:text-church-charcoal",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsToolbar;
