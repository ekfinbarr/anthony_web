import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type SermonsPaginationProps = {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  total?: number;
  from?: number;
  to?: number;
};

function pageWindow(current: number, last: number): (number | "ellipsis")[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < last - 1) pages.push("ellipsis");
  pages.push(last);
  return pages;
}

const SermonsPagination = ({
  currentPage,
  lastPage,
  onPageChange,
  total,
  from,
  to,
}: SermonsPaginationProps) => {
  if (lastPage <= 1) return null;

  const pages = pageWindow(currentPage, lastPage);

  return (
    <div className="mt-10 flex flex-col items-center gap-3">
      {typeof total === "number" && total > 0 ? (
        <p className="text-sm text-muted-foreground">
          Showing {from ?? 0}–{to ?? 0} of {total} sermons
        </p>
      ) : null}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage <= 1 ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`e-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < lastPage) onPageChange(currentPage + 1);
              }}
              className={currentPage >= lastPage ? "pointer-events-none opacity-40" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default SermonsPagination;
