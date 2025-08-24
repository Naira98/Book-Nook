import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { type BestSellersResponse } from "../../types/BestSeller";

export const useGetBestSeller = () => {
  const {
    data: bestSellerData,
    isPending,
    error,
  } = useQuery<BestSellersResponse>({
    queryKey: ["bestSellers"],
    queryFn: async () => await apiReq("GET", "/books/bestsellers"),
    staleTime: 1000 * 60 * 60, // 60 minutes
    // Medium priority - important but not critical
    gcTime: 1000 * 60 * 15, // 15 minutes cache
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchOnMount: true, // Refetch on mount for fresh data
  });

  return { bestSellerData, isPending, error };
};
