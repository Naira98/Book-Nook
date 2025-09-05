import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { UserOrderesResponse } from "../../types/Orders";
import { useGetMe } from "../auth/useGetMe";

export const useGetUserOrders = () => {
  const { me } = useGetMe();
  const {
    data: orders,
    isPending,
    error,
  } = useQuery<UserOrderesResponse>({
    queryKey: ["userOrders", `${me?.id}`],
    queryFn: async () => {
      return await apiReq("GET", `/order/my`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { orders, isPending, error };
};
