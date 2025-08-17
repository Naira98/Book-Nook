import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { toast } from "react-toastify";
import type { IUser } from "../../types/User";

interface MarkBookAsLostRequest {
  borrow_order_book_id: number;
  new_status: "LOST";
}

export const useMarkBookAsLost = () => {
  const queryClient = useQueryClient();
  const userId = queryClient.getQueryData<IUser>(["me"])!.id;

  const { mutate: markBookAsLost, isPending } = useMutation({
    mutationFn: async (values: MarkBookAsLostRequest) => {
      return await apiReq("PATCH", "/order/borrow_order_book_problem", values);
    },
    onSuccess: () => {
      toast("Book marked as lost", { type: "success" });
      queryClient.invalidateQueries({ queryKey: ["clientBorrows", userId] });
    },
    onError: (error) => {
      console.error("Error marking book as lost:", error);
      toast("Failed to mark book as lost", { type: "error" });
    },
  });

  return { markBookAsLost, isPending };
};
