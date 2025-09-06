import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { BorrowBookProblem } from "../../types/Orders";
import { useGetMe } from "../auth/useGetMe";
import { UserRole } from "../../types/User";

interface MarkBookAsLostRequest {
  borrow_order_book_id: number;
  new_status: BorrowBookProblem;
}

export const useUpdateBorrowOrderBookProblem = () => {
  const queryClient = useQueryClient();
  const { me } = useGetMe();

  const { mutate: updateBorrowBookProblem, isPending } = useMutation({
    mutationFn: async (values: MarkBookAsLostRequest) => {
      return await apiReq("PATCH", "/order/borrow_order_book_problem", values);
    },
    onSuccess: () => {
      if (me!.role == UserRole.CLIENT) {
        toast("Book marked as lost", { type: "warning" });
        queryClient.invalidateQueries({ queryKey: ["clientBorrows", me!.id] });
      }
    },
    onError: (error) => {
      console.error("Error marking book problem:", error);
      toast("Failed to change book problem", { type: "error" });
    },
  });

  return { updateBorrowBookProblem, isPending };
};
