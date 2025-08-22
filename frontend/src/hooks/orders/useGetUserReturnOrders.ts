import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { UserReturnOrderResponse } from "../../types/Orders";
import { useGetMe } from "../auth/useGetMe";

export const useGetUserReturnOrders = () => {
  const { me } = useGetMe();
  const {
    data: returnOrders,
    isPending,
    error,
  } = useQuery<UserReturnOrderResponse>({
    // The query will not execute if orderId is not available
    queryKey: ["userReturnOrders", `${me?.id}`],
    queryFn: async () => {
      return await apiReq("GET", `/return-order/my`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { returnOrders, isPending, error };
};
