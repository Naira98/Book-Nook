import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type {
  AllOrdersResponse,
  changeOrderStatusRequest,
  Order,
} from "../../types/Orders";

export function useChangeOrderStatus() {
  const queryClient = useQueryClient();
  const { mutate: changeOrderStatus, isPending } = useMutation({
    mutationFn: async (values: changeOrderStatusRequest) => {
      return await apiReq("PATCH", "/order/order_status", values);
    },
    onSuccess: (resp: Order) => {
      toast("Order status changed successfully", { type: "success" });
      queryClient.setQueryData(
        ["allStaffOrders"],
        (oldData: AllOrdersResponse) => {
          const newData = { ...oldData };
          newData.orders = newData.orders.map((order) =>
            order.id === resp.id ? { ...order, status: resp.status } : order,
          );
          return newData;
        },
      );
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { changeOrderStatus, isPending };
}
