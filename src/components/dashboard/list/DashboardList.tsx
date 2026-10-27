import { useEffect, useState, type ReactNode } from "react";
import { ALL } from "./listParams";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { PageMeta } from "@/services/account.service";
import { cn } from "@/lib/utils";

/**
 * Building blocks for the parishioner dashboard's list pages (Mass bookings,
 * donations, groups). List state lives in the URL so filters survive reloads
 * and other pages can deep-link (e.g. `/dashboard/donations?search=REF`).
 */

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  allLabel = "All",
  className,
}: {
  label: string;
  value?: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  allLabel?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5 min-w-0", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ALL} onValueChange={onChange}>
        <SelectTrigger className="h-10 bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allLabel !== null && <SelectItem value={ALL}>{allLabel}</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Search box + sort on one row; filters fold away behind a toggle on phones
 * and sit inline from `md` up.
 */
export function ListToolbar({
  search,
  onSearch,
  searchPlaceholder,
  sort,
  sortOptions,
  onSort,
  activeFilterCount = 0,
  onClear,
  children,
}: {
  search?: string;
  onSearch: (value: string) => void;
  searchPlaceholder: string;
  sort?: string;
  sortOptions?: FilterOption[];
  onSort?: (value: string) => void;
  activeFilterCount?: number;
  onClear?: () => void;
  children?: ReactNode;
}) {
  const [term, setTerm] = useState(search ?? "");
  const debounced = useDebouncedValue(term, 350);
  const [open, setOpen] = useState(activeFilterCount > 0);

  useEffect(() => {
    if ((debounced || "") !== (search || "")) onSearch(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Keep the box in sync when the URL changes from elsewhere (deep links, "clear"):
  // adjust during render rather than in an effect.
  const [syncedSearch, setSyncedSearch] = useState(search);
  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setTerm(search ?? "");
  }

  return (
    <Card className="border-church-gold/15 shadow-sm">
      <CardContent className="p-3 sm:p-4 space-y-3">
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 pl-9 bg-background"
                aria-label={searchPlaceholder}
              />
            </div>
            <div className="flex gap-2">
              {sortOptions && sortOptions.length > 0 && onSort && (
              <Select value={sort || sortOptions[0]?.value} onValueChange={onSort}>
                <SelectTrigger className="h-10 flex-1 sm:w-44 bg-background" aria-label="Sort by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              )}
              {children && (
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="h-10 shrink-0 gap-2" aria-expanded={open}>
                    <SlidersHorizontal className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="rounded-full bg-church-gold px-1.5 text-xs font-semibold text-church-charcoal">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>
          {children && (
            <CollapsibleContent className="data-[state=open]:animate-fade-in">
              <div className="mt-3 grid gap-3 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
              {onClear && (activeFilterCount > 0 || term) && (
                <Button variant="ghost" size="sm" className="mt-2 gap-1 px-2 text-muted-foreground" onClick={onClear}>
                  <X className="h-3.5 w-3.5" aria-hidden /> Clear all
                </Button>
              )}
            </CollapsibleContent>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
}

export function ListPagination({ meta, onPage, noun }: { meta?: PageMeta; onPage: (page: number) => void; noun: string }) {
  if (!meta || meta.total === 0) return null;

  const { current_page: page, last_page: last, total } = meta;
  const from = meta.from ?? (page - 1) * meta.per_page + 1;
  const to = meta.to ?? Math.min(page * meta.per_page, total);

  // Compact window: first, last, and neighbours of the current page.
  const pages = Array.from(new Set([1, page - 1, page, page + 1, last]))
    .filter((p) => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  return (
    <nav className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label={`${noun} pages`}>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–<span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> {noun}
      </p>
      {last > 1 && (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-9 w-9" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pages.map((p, i) => (
            <span key={p} className="flex items-center">
              {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-muted-foreground">…</span>}
              <Button
                variant={p === page ? "default" : "ghost"}
                size="icon"
                className={cn("h-9 w-9", p === page && "bg-church-charcoal text-church-pearl hover:bg-church-charcoal/90")}
                onClick={() => onPage(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            </span>
          ))}
          <Button variant="outline" size="icon" className="h-9 w-9" disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function ListEmpty({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center animate-fade-in">
        {icon}
        <h3 className="font-heading text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}

export function DashboardPageHeader({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
      <div className="flex items-center gap-4 min-w-0">
        {icon}
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div>}
    </div>
  );
}
