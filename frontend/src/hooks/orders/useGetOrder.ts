import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { Order } from "../../types/Orders";

export const useGetOrder = (orderId?: string) => {
  const {
    data: order,
    isPending,
    error,
  } = useQuery<Order>({
    queryKey: ["order", `${orderId}`],
    queryFn: async () => {
      return await apiReq("GET", `/order/${orderId}`);
    },
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { order, isPending, error };
};
