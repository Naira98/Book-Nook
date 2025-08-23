import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IBorrowBookDetails } from "../../types/BookDetails";

export const useGetBorrowBookDetails = (BookDetailsId?: string) => {
  const {
    data: bookDetails,
    isPending,
  } = useQuery<IBorrowBookDetails>({
    queryKey: ["borrowBookDetails", BookDetailsId],
    queryFn: async () => {
      return await apiReq("GET", `/books/borrow/${BookDetailsId}`);
    },
    enabled: !!BookDetailsId,
  });

  return { bookDetails, isPending };
};
