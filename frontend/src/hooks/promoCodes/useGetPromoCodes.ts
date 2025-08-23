import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { PromoCodeData } from "../../types/promoCode";

export const useGetPromoCodes = () => {
  const { data: promoCodes, isPending } = useQuery<PromoCodeData[]>({
    queryKey: ["promoCodes"],
    queryFn: async () => {
      return await apiReq("GET", "/promo-codes");
    },
    staleTime: 1000 * 60 * 5,
  });

  return { promoCodes, isPending };
};
