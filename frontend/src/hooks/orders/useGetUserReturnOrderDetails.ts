import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { UserReturnOrder } from "../../types/Orders";

export const useGetUserReturnOrderDetails = (
  returnOrderId: number | string | undefined,
) => {
  const {
    data: returnOrder,
    isPending,
    error,
  } = useQuery<UserReturnOrder>({
    // The query will not execute if returnOrderId is not available
    queryKey: ["ReturnOrderDetails", `${returnOrderId}`],
    queryFn: async () => {
      if (!returnOrderId) {
        throw new Error("Order ID is required to fetch an return order.");
      }
      return await apiReq("GET", `/return-order/my/details/${returnOrderId}`);
    },
    // Disable the query if returnOrderId is not provided to prevent unnecessary API calls
    enabled: !!returnOrderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { returnOrder, isPending, error };
};
