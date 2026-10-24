import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type EventsEmptyStateProps = {
  title?: string;
  description?: string;
  showClear?: boolean;
  onClear?: () => void;
};

const EventsEmptyState = ({
  title = "No events found",
  description = "Try adjusting your search or filters, or explore the parish calendar for liturgical observances.",
  showClear = false,
  onClear,
}: EventsEmptyStateProps) => {
  return (
    <div className="border border-dashed border-church-gold-warm/30 bg-church-pearl/40 px-6 py-14 text-center">
      <h3 className="font-serif text-xl font-semibold text-church-charcoal">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {showClear && onClear && (
          <Button type="button" variant="outlineGold" onClick={onClear}>
            Clear filters
          </Button>
        )}
        <Button asChild variant="church">
          <Link to="/calendar">Parish calendar</Link>
        </Button>
      </div>
    </div>
  );
};

export default EventsEmptyState;
