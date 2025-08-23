import { QueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { CreateOrderRequest } from "../../types/Orders";
import { useGetMe } from "../auth/useGetMe";

export function useCreateOrder() {
  const navigate = useNavigate();
  const { me } = useGetMe();
  const queryClient = new QueryClient();

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (values: CreateOrderRequest) => {
      return await apiReq("POST", "/order/", values);
    },
    onSuccess: () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      queryClient.invalidateQueries({ queryKey: ["cartItems", me?.id] });
      navigate("/orders-history");
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { createOrder, isPending };
}
