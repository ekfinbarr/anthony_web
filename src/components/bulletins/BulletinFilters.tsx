import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { BulletinMeta } from "@/services/bulletin.service";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type BulletinFiltersProps = {
  search: string;
  year: string;
  month: string;
  sort: string;
  meta?: BulletinMeta | null;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClearAll?: () => void;
  hasActiveFilters?: boolean;
};

const BulletinFilters = ({
  search,
  year,
  month,
  sort,
  meta,
  onSearchChange,
  onClearSearch,
  onYearChange,
  onMonthChange,
  onSortChange,
  onClearAll,
  hasActiveFilters,
}: BulletinFiltersProps) => {
  const years = meta?.years ?? [];
  const monthsForYear =
    year && meta?.months_by_year?.[year]
      ? meta.months_by_year[year].map((m) => m.month)
      : Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="mb-8 rounded-xl border border-church-gold-warm/15 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <Label htmlFor="bulletin-search" className="mb-1.5 block text-sm font-medium text-church-charcoal">
            Search
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="bulletin-search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search bulletins by title, date, or keyword…"
              className="border-church-gold-warm/25 pl-9 pr-9"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={onClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-church-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold-warm"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Searches title, description, and publication date.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-5">
          <div>
            <Label htmlFor="bulletin-year" className="mb-1.5 block text-sm font-medium">
              Year
            </Label>
            <Select value={year || "all"} onValueChange={(v) => onYearChange(v === "all" ? "" : v)}>
              <SelectTrigger id="bulletin-year" className="border-church-gold-warm/25">
                <SelectValue placeholder="All years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bulletin-month" className="mb-1.5 block text-sm font-medium">
              Month
            </Label>
            <Select
              value={month || "all"}
              onValueChange={(v) => onMonthChange(v === "all" ? "" : v)}
            >
              <SelectTrigger id="bulletin-month" className="border-church-gold-warm/25">
                <SelectValue placeholder="All months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {monthsForYear.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {MONTH_NAMES[m - 1]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="bulletin-sort" className="mb-1.5 block text-sm font-medium">
              Sort
            </Label>
            <Select value={sort || "newest"} onValueChange={onSortChange}>
              <SelectTrigger id="bulletin-sort" className="border-church-gold-warm/25">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && onClearAll && (
          <div className="lg:col-span-2 lg:flex lg:justify-end">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-church-gold-warm lg:w-auto"
              onClick={onClearAll}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulletinFilters;
