// src/hooks/books/useGetBooksByInterests.ts
import { useState, useEffect, useCallback } from "react";
import type { IPurchaseBook } from "../../types/Book";
import { fetchBooksByInterests } from "../../services/interests";

export const useGetBooksByInterests = () => {
  const [books, setBooks] = useState<IPurchaseBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBooksByInterests();
      setBooks(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || "Failed to fetch books");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch books once on mount
  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return {
    books,
    loading,
    error,
    refetch: loadBooks,
  };
};
