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
    <div className="mt-6 flex flex-col gap-4 md:flex-row items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex space-x-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={clsx(
            "rounded-lg border-2 px-3 py-1 text-sm font-medium transition-all",
            currentPage === 1
              ? "cursor-not-allowed border-gray-200 text-gray-400"
              : "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
          )}
        >
          Previous
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              "rounded-lg border-2 px-3 py-1 text-sm font-medium transition-all",
              currentPage === page
                ? "border-cyan-400 bg-cyan-50 text-cyan-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-cyan-200 hover:bg-cyan-50"
            )}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={clsx(
            "rounded-lg border-2 px-3 py-1 text-sm font-medium transition-all",
            currentPage === totalPages
              ? "cursor-not-allowed border-gray-200 text-gray-400"
              : "border-cyan-200 text-cyan-600 hover:bg-cyan-50"
          )}
        >
          Next
        </button>
      </div>
    </div>
  );
}