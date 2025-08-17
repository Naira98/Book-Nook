import clsx from "clsx";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const visiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    if (endPage - startPage < visiblePages - 1) {
      startPage = Math.max(1, endPage - visiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="text-sm text-gray-500">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={clsx(
            "btn-filter",
            currentPage === 1
              ? "cursor-not-allowed border-gray-200 text-gray-400 hover:border-gray-200 hover:bg-white"
              : "btn-filter-inactive",
          )}
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              "btn-filter",
              currentPage === page
                ? "btn-filter-active"
                : "btn-filter-inactive",
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={clsx(
            "btn-filter",
            currentPage === totalPages
              ? "cursor-not-allowed border-gray-200 text-gray-400 hover:border-gray-200 hover:bg-white"
              : "btn-filter-inactive",
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}
