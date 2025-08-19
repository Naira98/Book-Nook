import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { PromoCodeData } from "../../types/promoCode";

export const useGetPromoCodes = (adminView: boolean = false) => {
  const {
    data: promoCodes,
    isPending,
    error,
  } = useQuery<PromoCodeData[]>({
    queryKey: ["promoCodes", adminView ? "admin" : "public"],
    queryFn: async () => {
      const endpoint = adminView ? "/promo-codes" : "/promo-codes";
      return await apiReq("GET", endpoint);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { promoCodes, isPending, error };
};