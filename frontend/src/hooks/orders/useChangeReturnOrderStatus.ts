import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type {
  AllOrdersResponse,
  changeRetrunOrderStatusRequest,
  ReturnOrder,
} from "../../types/Orders";

export function useChangeReturnOrderStatus() {
  const queryClient = useQueryClient();
  const { mutate: changeReturnOrderStatus, isPending } = useMutation({
    mutationFn: async (values: changeRetrunOrderStatusRequest) => {
      return await apiReq("PATCH", "/return-order/return-order-status", values);
    },
    onSuccess: (resp: ReturnOrder) => {
      toast("Return Order status changed successfully", { type: "success" });

      queryClient.setQueryData(
        ["allStaffOrders"],
        (oldData: AllOrdersResponse) => {
          if (oldData) {
            const newData = { ...oldData };
            newData.return_orders = newData.return_orders.map((retrunOrder) =>
              retrunOrder.id === resp.id
                ? {
                    ...retrunOrder,
                    status: resp.status,
                    courier_id: resp.courier_id,
                  }
                : retrunOrder,
            );
            return newData;
          }
        },
      );

      if (resp.status != "ON_THE_WAY") {
        queryClient.setQueryData(
          ["returnOrder", `${resp.id}`],
          (oldData: AllOrdersResponse) => {
            if (oldData) return { ...oldData, status: resp.status };
          },
        );
      }
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { changeReturnOrderStatus, isPending };
}
