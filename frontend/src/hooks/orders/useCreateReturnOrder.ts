import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { PickUpType } from "../../types/Orders";
import type { IUser } from "../../types/User";

interface CreateReturnOrderRequest {
  pickup_type: PickUpType;
  address: string;
  phone_number: string;
  borrowed_books_ids: number[];
}

export const useCreateReturnOrder = () => {
  const queryClient = useQueryClient();
  const userId = queryClient.getQueryData<IUser>(["me"])!.id;
  const navigate = useNavigate();

  const { mutate: createReturnOrder, isPending } = useMutation({
    mutationFn: async (values: CreateReturnOrderRequest) => {
      return await apiReq("POST", "/return-order", values);
    },
    onSuccess: () => {
      toast("Return order created successfully", { type: "success" });
      queryClient.invalidateQueries({ queryKey: ["clientBorrows", userId] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/orders-history?tab=returnOrders");
    },
    onError: (error) => {
      console.log(error);
      toast("Failed to create return order", { type: "error" });
    },
  });

  return { createReturnOrder, isPending };
};
