import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { type BestSellersResponse } from "../../types/BestSeller";

export const useGetBestSeller = () => {
  const {
    data: bestBooksData,
    isPending,
    error,
  } = useQuery<BestSellersResponse>({
    queryKey: ["bestSellers"],
    queryFn: async () => await apiReq("GET", "/books/bestsellers"),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return { bestBooksData, isPending, error };
};
