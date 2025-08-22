import { useMemo, useState } from "react";
import BookTable from "../../components/books/BookTable";
import Pagination from "../../components/shared/pagination/Pagination";
import { useGetBooksTable } from "../../hooks/books/useGetBooksTable";

import { CirclePlus } from "lucide-react";
import { Link } from "react-router-dom";
import SearchBar from "../../components/shared/SearchBar";
import FilterBooks from "../../components/staff/FilterBooks";
import { useFiltering } from "../../hooks/books/useFiltering";
import { FilterAvailability, type IBookTable } from "../../types/BookTable";

const BOOKS_PER_PAGE = 8;

export default function BooksTablePage() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterAvailability, setFilterAvailability] =
    useState<FilterAvailability>(FilterAvailability.All);

  const { books: allBooks, isPending } = useGetBooksTable();

  const booksArray: IBookTable[] = useMemo(() => allBooks || [], [allBooks]);

  const filteredBooks = useFiltering(
    booksArray,
    filterAvailability,
    searchTerm,
  );

  // --- Pagination Logic ---
  const totalFilteredBooks = filteredBooks.length;
  const totalPages = Math.ceil(totalFilteredBooks / BOOKS_PER_PAGE);

  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const endIndex = startIndex + BOOKS_PER_PAGE;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  const handleSearchChange = (e: string) => {
    setSearchTerm(e);
    setCurrentPage(1);
  };

  const handleAvailabilityChange = (value: FilterAvailability) => {
    setFilterAvailability(value);
    setCurrentPage(1);
  };

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-gray-700">
        Loading books...
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between">
        <h2 className="text-primary text-3xl font-semibold">Books</h2>
        <Link to="/staff/books/create-book">
          <div className="btn-sky">
            <CirclePlus className="w-5" />
            Create Book
          </div>
        </Link>
      </div>

      <div className="mb-6 rounded-xl border-2 border-dashed border-sky-100 bg-white p-6 shadow">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <SearchBar
            placeholder="Search books, authors or categories..."
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
          />

          <FilterBooks
            purchaseOptions={purchaseOptions}
            borrowOptions={borrowOptions}
            handleAvailabilityChange={handleAvailabilityChange}
            filterAvailability={filterAvailability}
          />
        </div>
      </div>

      {totalFilteredBooks === 0 && searchTerm && (
        <div className="mt-8 text-center text-lg text-gray-600">
          No books found matching "{searchTerm}" with the selected availability.
        </div>
      )}

      {totalFilteredBooks === 0 &&
        !searchTerm &&
        filterAvailability !== "All" && (
          <div className="mt-8 text-center text-lg text-gray-600">
            No books found with the selected availability.
          </div>
        )}

      {totalFilteredBooks > 0 && <BookTable books={paginatedBooks} />}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </>
  );
}

const purchaseOptions = [
  { value: FilterAvailability.PurchaseInStock, label: "In Stock" },
  { value: FilterAvailability.PurchaseOutOfStock, label: "Out of Stock" },
];

const borrowOptions = [
  { value: FilterAvailability.BorrowInStock, label: "In Stock" },
  { value: FilterAvailability.BorrowOutOfStock, label: "Out of Stock" },
];
