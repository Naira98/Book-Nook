import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IPurchaseBook } from "../../types/Book";

export const useGetPurchaseBooks = (book_details_id?: number) => {
  const queryKey = ["purchaseBooks"];
  if (book_details_id) {
    queryKey.push(book_details_id.toString());
  }

  const { data: purchaseBooks, isPending } = useQuery<IPurchaseBook[]>({
    queryKey: queryKey,
    queryFn: async () => {
      if (book_details_id) {
        return await apiReq("GET", `/books/purchase/${book_details_id}`);
      }
      return await apiReq("GET", "/books/purchase");
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    purchaseBooks,
    isPending,
  };
};
