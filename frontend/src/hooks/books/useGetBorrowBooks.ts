import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IBorrowBook } from "../../types/Book";

// Define a type for the API's paginated response
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Define the shape of the filter parameters
interface BookFilters {
  search?: string;
  authors_ids?: string;
  categories_ids?: string;
  book_details_id?: number;
  page?: number;
  limit?: number;
}

export const useGetBorrowBooks = (filters?: BookFilters) => {
  // The query key now includes all filter parameters.
  // This ensures a new query is triggered and cached whenever any filter changes.

  const queryKey = filters ? ["borrowBooks", filters] : ["borrowBooks"];

  const { data, isPending } = useQuery<PaginatedResponse<IBorrowBook>>({
    queryKey: queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
      }

      return await apiReq("GET", `/books/borrow?${params.toString()}`);
    },
    // Keep the existing React Query configuration
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    books: data?.items,
    pagination: {
      total: data?.total,
      page: data?.page,
      limit: data?.limit,
      pages: data?.pages,
    },
    isPending,
  };
};
