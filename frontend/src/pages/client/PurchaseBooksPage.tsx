import clsx from "clsx";
import { CheckSquare, ChevronDown, Clock, Square } from "lucide-react";
import { useEffect, useState } from "react";
import HorizontalBookCard from "../../components/client/HorizontalBookCard";
import Pagination from "../../components/shared/pagination/Pagination";
import SearchBar from "../../components/shared/SearchBar";
import Spinner from "../../components/shared/Spinner";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import { useGetCategories } from "../../hooks/books/useGetCategories";
import { useGetPurchaseBooks } from "../../hooks/books/useGetPruchaseBooks";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { useFilterBooks } from "../../utils/useFilterBook";

const PurchaseBooksPage = () => {
  const { purchaseBooks, isPending: isPendingGettingBooks } =
    useGetPurchaseBooks();
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();
  const { categories, isPending: isPendingCategories } = useGetCategories();
  const { authors, isPending: isPendingAuthors } = useGetAuthors();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<number[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const isLoading =
    isPendingGettingBooks ||
    isPendingGettingCartItems ||
    isPendingCategories ||
    isPendingAuthors;

  const toggleSelection = (
    list: number[],
    setter: (value: number[]) => void,
    id: number,
  ) => {
    if (list.includes(id)) {
      setter(list.filter((x) => x !== id));
    } else {
      setter([...list, id]);
    }
  };

  const filteredBooks = useFilterBooks(
    purchaseBooks,
    searchTerm,
    selectedCategoryIds,
    selectedAuthorIds,
  );

  // Reset to first page when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryIds, selectedAuthorIds, purchaseBooks]);

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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          {/* Left: Filters */}
          <aside className="border-accent border-r-1 md:col-span-1">
            <div className="py-4">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Filter
              </h2>

              {/* Categories */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsCategoriesOpen((prev) => !prev)}
                  className={clsx(
                    "mb-2 flex w-full items-center justify-between text-left text-sm font-medium text-gray-600",
                  )}
                  aria-expanded={isCategoriesOpen}
                >
                  <span>Categories</span>

                  <ChevronDown
                    className={clsx(
                      "h-4 w-4 text-gray-400 transition-all duration-300 ease-in-out",
                      { "-rotate-90": isCategoriesOpen },
                    )}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isCategoriesOpen
                      ? "max-h-64 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="max-h-64 space-y-2 overflow-auto pr-2">
                    {(
                      (categories ?? []) as Array<{ id: number; name: string }>
                    ).map((category: { id: number; name: string }) => {
                      const isSelected = selectedCategoryIds.includes(
                        category.id,
                      );
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() =>
                            toggleSelection(
                              selectedCategoryIds,
                              setSelectedCategoryIds,
                              category.id,
                            )
                          }
                          aria-pressed={isSelected}
                          className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span>{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Authors */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsAuthorsOpen((prev) => !prev)}
                  className="mb-2 flex w-full items-center justify-between text-left text-sm font-medium text-gray-600"
                  aria-expanded={isAuthorsOpen}
                >
                  <span>Authors</span>
                  <ChevronDown
                    className={clsx(
                      "h-4 w-4 text-gray-400 transition-all duration-300 ease-in-out",
                      { "-rotate-90": isAuthorsOpen },
                    )}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isAuthorsOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="max-h-64 space-y-2 overflow-auto pr-2">
                    {(
                      (authors ?? []) as Array<{ id: number; name: string }>
                    ).map((author: { id: number; name: string }) => {
                      const isSelected = selectedAuthorIds.includes(author.id);
                      return (
                        <button
                          key={author.id}
                          type="button"
                          onClick={() =>
                            toggleSelection(
                              selectedAuthorIds,
                              setSelectedAuthorIds,
                              author.id,
                            )
                          }
                          aria-pressed={isSelected}
                          className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                          <span>{author.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Content */}
          <section className="md:col-span-5">
            <div className="mb-4">
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

export default PurchaseBooksPage;
