import { cn } from "@/lib/utils";

export type EventCategoryOption = {
  slug: string;
  label: string;
};

type EventsFiltersProps = {
  categories: EventCategoryOption[];
  value: string;
  onChange: (slug: string) => void;
};

const EventsFilters = ({ categories, value, onChange }: EventsFiltersProps) => {
  const items = [{ slug: "all", label: "All Events" }, ...categories];

  return (
    <div className="relative">
      <div
        role="tablist"
        aria-label="Event categories"
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const active = (value || "all") === item.slug;
          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.slug === "all" ? "" : item.slug)}
              className={cn(
                "shrink-0 border px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "border-church-gold-warm bg-church-gold/15 text-church-charcoal"
                  : "border-church-gold-warm/20 bg-white text-muted-foreground hover:border-church-gold-warm/40 hover:text-church-charcoal",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EventsFilters;
