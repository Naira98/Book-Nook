import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { ReturnOrder } from "../../types/Orders";

export const useGetReturnOrder = (
  returnOrderId: number | string | undefined,
) => {
  const {
    data: returnOrder,
    isPending,
    error,
  } = useQuery<ReturnOrder>({
    // The query will not execute if orderId is not available
    queryKey: ["returnOrder", `${returnOrderId}`],
    queryFn: async () => {
      if (!returnOrderId) {
        throw new Error("Order ID is required to fetch an order.");
      }
      return await apiReq("GET", `/return-order/${returnOrderId}`);
    },
    // Disable the query if orderId is not provided to prevent unnecessary API calls
    enabled: !!returnOrderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { returnOrder, isPending, error };
};
