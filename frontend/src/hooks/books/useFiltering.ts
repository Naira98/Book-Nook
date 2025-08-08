import { useMemo } from "react";
import type { IBookTable } from "../../types/BookTable";

export function useFiltering(
  booksArray: IBookTable[],
  filterAvailability: string,
  searchTerm: string,
) {
  return useMemo(() => {
    let currentBooks = booksArray;

    if (filterAvailability !== "All") {
      if (filterAvailability === "PurchaseInStock") {
        currentBooks = currentBooks.filter(
          (book) => book.available_stock_purchase > 0,
        );
      } else if (filterAvailability === "PurchaseOutOfStock") {
        currentBooks = currentBooks.filter(
          (book) => book.available_stock_purchase == 0,
        );
      } else if (filterAvailability === "BorrowInStock") {
        currentBooks = currentBooks.filter(
          (book) => book.available_stock_borrow > 0,
        );
      } else if (filterAvailability === "BorrowOutOfStock") {
        currentBooks = currentBooks.filter(
          (book) => book.available_stock_borrow == 0,
        );
      }
    }

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      currentBooks = currentBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(lowercasedSearchTerm) ||
          book.author_name.toLowerCase().includes(lowercasedSearchTerm) ||
          book.category_name.toLowerCase().includes(lowercasedSearchTerm),
      );
    }
    return currentBooks;
  }, [booksArray, searchTerm, filterAvailability]);
}
