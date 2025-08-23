import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";

export function useDeleteCartItem() {
  const { mutate: deleteCartItem, isPending } = useMutation({
    mutationFn: async (cartItemId: number) => {
      return await apiReq("DELETE", `/cart/${cartItemId}`);
    },
    onError: (err) => {
      toast(err.message, { type: "error" });
    },
  });

  return { deleteCartItem, isPending };
}
