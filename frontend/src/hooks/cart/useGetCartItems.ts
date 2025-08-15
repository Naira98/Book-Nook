import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { AllCartItemsResponse } from "../../types/Cart";

export const useGetCartItems = () => {
  const {
    data: cartItems,
    isPending,
    error,
  } = useQuery<AllCartItemsResponse>({
    queryKey: ["cartItems"],
    queryFn: async () => {
      return await apiReq("GET", "/cart");
    },
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minute
  });

  return { cartItems, isPending, error };
};
