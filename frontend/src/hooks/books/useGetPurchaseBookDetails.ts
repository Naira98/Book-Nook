import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IPurchaseBookDetails } from "../../types/BookDetails";

export const useGetPurchaseBookDetails = (BookDetailsId?: string) => {
  const { data: bookDetails, isPending } = useQuery<IPurchaseBookDetails>({
    queryKey: ["purchaseBookDetails", BookDetailsId],
    queryFn: async () => {
      return await apiReq("GET", `/books/purchase/${BookDetailsId}`);
    },
    enabled: !!BookDetailsId,
  });

  return { bookDetails, isPending };
};
