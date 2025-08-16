import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IBorrowBook } from "../../types/Book";

export const useGetBorrowBooks = (book_details_id?: number) => {
  const queryKey = ["borrowBooks"];
  if (book_details_id) {
    queryKey.push(book_details_id.toString());
  }

  const { data: borrowBooks, isPending } = useQuery<IBorrowBook[]>({
    queryKey: queryKey,
    queryFn: async () => {
      if (book_details_id) {
        return await apiReq("GET", `/books/borrow/${book_details_id}`);
      }
      return await apiReq("GET", "/books/borrow");
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    borrowBooks,
    isPending,
  };
};
