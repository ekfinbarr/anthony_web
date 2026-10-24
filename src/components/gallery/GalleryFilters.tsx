import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GalleryAlbumSort, GalleryMediaTypeFilter } from "@/services/galleryAlbum.service";

type CategoryOption = { id: string; label: string };

type GalleryFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  categories: CategoryOption[];
  categoryId: string;
  onCategoryChange: (id: string) => void;
  years: number[];
  year: string;
  onYearChange: (year: string) => void;
  mediaType: "" | GalleryMediaTypeFilter;
  onMediaTypeChange: (type: "" | GalleryMediaTypeFilter) => void;
  sort: GalleryAlbumSort;
  onSortChange: (sort: GalleryAlbumSort) => void;
};

const mediaTabs: { value: "" | GalleryMediaTypeFilter; label: string }[] = [
  { value: "", label: "All Media" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
];

const GalleryFilters = ({
  search,
  onSearchChange,
  onClearSearch,
  categories,
  categoryId,
  onCategoryChange,
  years,
  year,
  onYearChange,
  mediaType,
  onMediaTypeChange,
  sort,
  onSortChange,
}: GalleryFiltersProps) => {
  return (
    <div className="mb-10 space-y-4 rounded-xl border border-church-gold-warm/15 bg-white/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Media type"
      >
        {mediaTabs.map((tab) => {
          const active = mediaType === tab.value;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onMediaTypeChange(tab.value)}
              className={cn(
                "rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
                active
                  ? "bg-church-charcoal text-church-pearl"
                  : "bg-church-pearl text-church-charcoal hover:bg-church-stone/40",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 md:grid-cols-12">
        <div className="relative md:col-span-5">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, captions…"
            className="pl-9 pr-9"
            aria-label="Search gallery"
          />
          {search ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-church-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <Select value={categoryId || "all"} onValueChange={(v) => onCategoryChange(v === "all" ? "" : v)}>
            <SelectTrigger aria-label="Category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select value={year || "all"} onValueChange={(v) => onYearChange(v === "all" ? "" : v)}>
            <SelectTrigger aria-label="Year">
              <SelectValue placeholder="Year" />
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

        <div className="md:col-span-3">
          <Select value={sort} onValueChange={(v) => onSortChange(v as GalleryAlbumSort)}>
            <SelectTrigger aria-label="Sort order">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="featured">Featured first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GalleryFilters;
