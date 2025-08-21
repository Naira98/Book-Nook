import { Clock, Filter } from "lucide-react";
import { useState } from "react";
import FilteringSection from "../../components/client/FilteringSection";
import HorizontalBookCard from "../../components/client/HorizontalBookCard";
import Pagination from "../../components/shared/pagination/Pagination";
import SearchBar from "../../components/shared/SearchBar";
import Spinner from "../../components/shared/Spinner";

// Update the import to use the new hook with filters
import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";

const BorrowBooksPage = () => {
  // State for user input (search, filters, page)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Define a fixed limit for items per page
  const PAGE_LIMIT = 10;

  // Build the filter object to pass to the hook
  const filters = {
    search: searchTerm || undefined, // Pass undefined if empty to avoid querying an empty string
    authors_ids: selectedAuthorIds.join(",") || undefined, // Convert array to comma-separated string
    categories_ids: selectedCategoryIds.join(",") || undefined, // Convert array to comma-separated string
    page: currentPage,
    limit: PAGE_LIMIT,
  };

  // Call the new hook with the filters object
  const {
    books,
    pagination,
    isPending: isPendingGettingBooks,
  } = useGetBorrowBooks(filters);

  // Fetch cart items as before
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();

  const isLoading = isPendingGettingBooks || isPendingGettingCartItems;

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
                // When search changes, reset to the first page
                handleSearchChange={(e) => {
                  console.log("Search term changed:", e);

                  setSearchTerm(e);
                  setCurrentPage(1);
                }}
              />
            </div>

            {books && books.length > 0 ? (
              <div className="flex flex-col gap-4">
                {books.map((book) => (
                  <HorizontalBookCard
                    book={book}
                    cartItems={cartItems}
                    key={book.book_details_id}
                  />
                ))}
                <Pagination
                  currentPage={pagination?.page || 1}
                  totalPages={pagination?.pages || 1}
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
