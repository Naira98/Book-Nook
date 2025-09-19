import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { CreateOrderRequest } from "../../types/Orders";
import { useGetMe } from "../auth/useGetMe";

export function useCreateOrder() {
  const navigate = useNavigate();
  const { me } = useGetMe();
  const queryClient = useQueryClient();

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (values: CreateOrderRequest) => {
      return await apiReq("POST", "/order/", values);
    },
    onSuccess: async () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["userOrders", me?.id] });
      navigate("/orders-history?tab=orders");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["cartItems", me?.id] });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { createOrder, isPending };
}
