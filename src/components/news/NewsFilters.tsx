import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NewsCategoryOption = {
  slug: string;
  label: string;
};

type NewsFiltersProps = {
  categories: NewsCategoryOption[];
  activeCategory: string;
  search: string;
  onCategoryChange: (slug: string) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
};

const NewsFilters = ({
  categories,
  activeCategory,
  search,
  onCategoryChange,
  onSearchChange,
  onClearSearch,
}: NewsFiltersProps) => {
  return (
    <div className="mb-10 space-y-5">
      <div className="relative mx-auto max-w-xl">
        <label htmlFor="news-search" className="sr-only">
          Search news and updates
        </label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="news-search"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search parish news…"
          className="h-11 border-church-gold-warm/25 bg-white pl-10 pr-10 focus-visible:ring-church-gold"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Filter by category"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin"
      >
        <FilterChip
          label="All News"
          selected={!activeCategory}
          onSelect={() => onCategoryChange("")}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat.slug}
            label={cat.label}
            selected={activeCategory === cat.slug}
            onSelect={() => onCategoryChange(cat.slug)}
          />
        ))}
      </div>
    </div>
  );
};

const FilterChip = ({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={selected}
    onClick={onSelect}
    className={cn(
      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none",
      "focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
      selected
        ? "border-church-gold-warm bg-church-charcoal text-church-pearl"
        : "border-church-gold-warm/30 bg-white text-church-charcoal hover:border-church-gold-warm hover:bg-church-pearl",
    )}
  >
    {label}
  </button>
);

export default NewsFilters;
