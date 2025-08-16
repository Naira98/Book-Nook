import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { AllCartItemsResponse } from "../../types/Cart";
import type { IUser } from "../../types/User";

export const useGetCartItems = () => {
  const queryClient = useQueryClient();
  const userId = queryClient.getQueryData<IUser>(["me"])!.id;

  const {
    data: cartItems,
    isPending,
    error,
  } = useQuery<AllCartItemsResponse>({
    queryKey: ["cartItems", userId],
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
