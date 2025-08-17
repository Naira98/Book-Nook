import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { Order } from "../../types/Orders";

export const useGetOrder = (orderId: number | string | undefined) => {
  const {
    data: order,
    isPending,
    error,
  } = useQuery<Order>({
    // The query will not execute if orderId is not available
    queryKey: ["order", `${orderId}`],
    queryFn: async () => {
      if (!orderId) {
        throw new Error("Order ID is required to fetch an order.");
      }
      return await apiReq("GET", `/order/${orderId}`);
    },
    // Disable the query if orderId is not provided to prevent unnecessary API calls
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { order, isPending, error };
};
