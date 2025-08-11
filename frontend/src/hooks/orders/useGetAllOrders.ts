import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { AllOrdersResponse } from "../../types/Orders";

export const useGetAllOrders = () => {
  const {
    data: allOrders,
    isPending,
    error,
  } = useQuery<AllOrdersResponse>({
    queryKey: ["allStaffOrders"],
    queryFn: async () => {
      return await apiReq("GET", `/order/all?order_status=COURIER`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { allOrders, isPending, error };
};
