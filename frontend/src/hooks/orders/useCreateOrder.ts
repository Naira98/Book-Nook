import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { CreateOrderRequest } from "../../types/Orders";
import { useNavigate } from "react-router-dom";

export function useCreateOrder() {
  const navigate = useNavigate();
  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (values: CreateOrderRequest) => {
      return await apiReq("POST", "/order/", values);
    },
    onSuccess: () => {
      toast.success("Order created successfully");
      navigate("/");
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { createOrder, isPending };
}
