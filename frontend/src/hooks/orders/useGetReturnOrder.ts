import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { ReturnOrder } from "../../types/Orders";

export const useGetReturnOrder = (returnOrderId?: string) => {
  const {
    data: returnOrder,
    isPending,
    error,
  } = useQuery<ReturnOrder>({
    queryKey: ["returnOrder", `${returnOrderId}`],
    queryFn: async () => {
      return await apiReq("GET", `/return-order/${returnOrderId}`);
    },
    enabled: !!returnOrderId,
    staleTime: 1000 * 60 * 5,
  });

  return { returnOrder, isPending, error };
};
