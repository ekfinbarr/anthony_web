import { Link } from "react-router-dom";
import { Frame, SearchX, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type GalleryEmptyStateProps = {
  variant: "empty" | "no-results" | "error";
  onRetry?: () => void;
  onClearFilters?: () => void;
};

const copy = {
  empty: {
    icon: Frame,
    title: "No memories published yet",
    description:
      "Photographs and videos from parish celebrations will appear here as collections are shared. Check back soon.",
  },
  "no-results": {
    icon: SearchX,
    title: "No matching collections",
    description: "Try a different search, year, or category — or clear filters to browse all parish memories.",
  },
  error: {
    icon: WifiOff,
    title: "We couldn't load the gallery",
    description: "Please try again in a moment. If the problem continues, visit us at the parish office.",
  },
} as const;

const GalleryEmptyState = ({ variant, onRetry, onClearFilters }: GalleryEmptyStateProps) => {
  const { icon: Icon, title, description } = copy[variant];

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-church-gold-warm/20 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-church-gold/15 text-church-gold-warm">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-2xl font-semibold text-church-charcoal">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {variant === "error" && onRetry && (
          <Button variant="church" onClick={onRetry}>
            Try again
          </Button>
        )}
        {variant === "no-results" && onClearFilters && (
          <Button variant="church" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {variant === "empty" && (
          <Button variant="outline" asChild>
            <Link to="/contact">Contact the parish</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default GalleryEmptyState;
