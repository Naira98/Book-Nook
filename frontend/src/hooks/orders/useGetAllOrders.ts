import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { AllOrdersResponse, PickUpType } from "../../types/Orders";

export const useGetAllOrders = (pickupType: PickUpType) => {
  const {
    data: allOrders,
    isPending,
    error,
  } = useQuery<AllOrdersResponse>({
    queryKey: ["allStaffOrders"],
    queryFn: async () => {
      return await apiReq("GET", `/order/all?pickup_type=${pickupType}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { allOrders, isPending, error };
};
