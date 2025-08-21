import { Clock, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import FilteringSection from "../../components/client/FilteringSection";
import HorizontalBookCard from "../../components/client/HorizontalBookCard";
import Pagination from "../../components/shared/pagination/Pagination";
import SearchBar from "../../components/shared/SearchBar";
import Spinner from "../../components/shared/Spinner";
import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { useFilterBooks } from "../../utils/useFilterBook";

const BorrowBooksPage = () => {
  const { borrowBooks, isPending: isPendingGettingBooks } = useGetBorrowBooks();
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const isLoading = isPendingGettingBooks || isPendingGettingCartItems;

  const filteredBooks = useFilterBooks(
    borrowBooks,
    searchTerm,
    selectedCategoryIds,
    selectedAuthorIds,
  );

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryIds, selectedAuthorIds, borrowBooks]);

  const totalPages = Math.max(
    1,
    Math.ceil((filteredBooks?.length ?? 0) / pageSize),
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const pagedBooks = filteredBooks.slice(startIndex, startIndex + pageSize);

  if (isLoading) return <Spinner />;

  if (!cartItems) return <div>No cart data available.</div>;

  return (
    <div className="min-h-screen font-sans">
      <div className="container mx-auto py-8">
        <div className="flex gap-6 lg:flex-row">
          {/* Left: Filters */}
          <FilteringSection
            selectedCategoryIds={selectedCategoryIds}
            setSelectedCategoryIds={setSelectedCategoryIds}
            selectedAuthorIds={selectedAuthorIds}
            setSelectedAuthorIds={setSelectedAuthorIds}
            isOpen={isFilterSidebarOpen}
            onClose={() => setIsFilterSidebarOpen(false)}
          />

          {/* Right: Content */}
          <section className="w-full lg:w-[80%]">
            <div className="mb-4 flex items-center gap-4">
              <button
                onClick={() => setIsFilterSidebarOpen(true)}
                className="rounded-md bg-white p-2 shadow-sm lg:hidden"
                aria-label="Open filters"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
              <SearchBar
                placeholder="Search borrow books..."
                searchTerm={searchTerm}
                handleSearchChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredBooks && filteredBooks.length > 0 ? (
              <div className="flex flex-col gap-4">
                {pagedBooks.map((book) => (
                  <HorizontalBookCard
                    book={book}
                    cartItems={cartItems}
                    key={book.book_details_id}
                  />
                ))}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            ) : (
              <div className="py-12 text-center">
                <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-medium text-black">
                  No books found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria to find more books
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default BorrowBooksPage;
