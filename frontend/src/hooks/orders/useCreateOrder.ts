import { QueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { CreateOrderRequest } from "../../types/Orders";

export function useCreateOrder() {
  const navigate = useNavigate();
  const queryClient = new QueryClient();

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (values: CreateOrderRequest) => {
      return await apiReq("POST", "/order/", values);
    },
    onSuccess: () => {
      toast.success("Order created successfully");
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
      navigate("/");
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { createOrder, isPending };
}
