import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number;
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const safeOnChange = (page: number) => {
    const next = Math.max(1, Math.min(totalPages, page));
    onPageChange(next);
  };

  const pagesToShow = Math.min(maxPagesToShow, totalPages);
  const pages = Array.from({ length: pagesToShow }, (_, i) => {
    if (totalPages <= pagesToShow) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - (pagesToShow - 1) + i;
    return currentPage - 2 + i;
  });

  const showEllipsis = totalPages > pagesToShow && currentPage < totalPages - 2;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => safeOnChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              onClick={() => safeOnChange(p)}
              isActive={currentPage === p}
              className="cursor-pointer"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            onClick={() => safeOnChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}


