import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { AllCartItemsResponse } from "../../types/Cart";
import { useGetMe } from "../auth/useGetMe";

export const useGetCartItems = (staleTime = 1000 * 60 * 5) => {
  const { me } = useGetMe();
  const {
    data: cartItems,
    isPending,
    error,
  } = useQuery<AllCartItemsResponse>({
    queryKey: ["cartItems", me?.id],
    queryFn: async () => {
      return await apiReq("GET", "/cart");
    },
    enabled: !!me?.id, // Only run when user is loaded
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: staleTime,
    // Lower priority than user data but higher than recommendations
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  return { cartItems, isPending, error };
};
