import { useMemo } from "react";
import type { IBorrowBook, IPurchaseBook } from "../types/Book";

export function useFilterBooks(
  borrowBooks: IBorrowBook[] | IPurchaseBook[] | undefined,
  searchTerm: string,
  selectedCategoryIds: number[],
  selectedAuthorIds: number[],
) {
  return useMemo(() => {
    if (!borrowBooks) return [];
    const term = searchTerm.trim().toLowerCase();
    return borrowBooks.filter((book) => {
      const matchCategory =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.includes(book.category.id);
      const matchAuthor =
        selectedAuthorIds.length === 0 ||
        selectedAuthorIds.includes(book.author.id);
      const matchQuery =
        term.length === 0 ||
        book.title.toLowerCase().includes(term) ||
        book.author.name.toLowerCase().includes(term) ||
        book.category.name.toLowerCase().includes(term);
      return matchCategory && matchAuthor && matchQuery;
    });
  }, [borrowBooks, searchTerm, selectedCategoryIds, selectedAuthorIds]);
}
