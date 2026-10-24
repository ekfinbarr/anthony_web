import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

type BulletinEmptyStateProps = {
  variant?: "empty" | "no-results";
  onClear?: () => void;
};

const BulletinEmptyState = ({ variant = "empty", onClear }: BulletinEmptyStateProps) => {
  const isNoResults = variant === "no-results";

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-church-gold-warm/25 bg-white px-6 py-16 text-center"
      role="status"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-church-gold/15 text-church-gold-warm">
        <FileText className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-church-charcoal">
        {isNoResults ? "No bulletins match your search" : "No bulletins published yet"}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {isNoResults
          ? "Try a different keyword, clear the date filters, or browse another month."
          : "Sunday bulletins will appear here once the parish publishes the first edition."}
      </p>
      {isNoResults && onClear && (
        <Button variant="church" className="mt-6" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
};

export default BulletinEmptyState;
