import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BulletinPaginationProps = {
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

const BulletinPagination = ({
  page,
  lastPage,
  total,
  onPageChange,
  className,
}: BulletinPaginationProps) => {
  if (lastPage <= 1) {
    return total > 0 ? (
      <p className={cn("text-center text-sm text-muted-foreground", className)} aria-live="polite">
        {total} {total === 1 ? "edition" : "editions"}
      </p>
    ) : null;
  }

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav
      className={cn("flex flex-col items-center gap-3 sm:flex-row sm:justify-between", className)}
      aria-label="Bulletin archive pagination"
    >
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Page {page} of {lastPage}
        <span className="mx-1.5 text-church-gold-warm/50" aria-hidden="true">
          ·
        </span>
        {total} {total === 1 ? "edition" : "editions"}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="border-church-gold-warm/30"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
        </Button>

        {pages.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={`e-${idx}`} className="px-2 text-muted-foreground" aria-hidden="true">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "church" : "outline"}
              size="sm"
              className={cn("min-w-9", p !== page && "border-church-gold-warm/30")}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="border-church-gold-warm/30"
        >
          <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
};

export default BulletinPagination;
