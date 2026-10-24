import { Button } from "@/components/ui/button";

type EventsPaginationProps = {
  page: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;
};

const EventsPagination = ({ page, lastPage, total, onPageChange }: EventsPaginationProps) => {
  if (lastPage <= 1) return null;

  return (
    <nav className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label="Events pagination">
      <p className="text-sm text-muted-foreground">
        Page {page} of {lastPage}
        {typeof total === "number" ? ` · ${total} events` : ""}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
};

export default EventsPagination;
