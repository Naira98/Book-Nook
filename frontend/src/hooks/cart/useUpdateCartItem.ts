import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { UpdateCartItemRequest } from "../../types/Cart";


export function useUpdateCartItem() {
  const { mutate: updateCartItem, isPending } = useMutation({
    mutationFn: async (values: UpdateCartItemRequest) => {
      return await apiReq("PATCH", "/cart", values);
    },
    onSuccess: () => {
      toast("Book updated successfully!", { type: "success" });
    },
    onError: (err) => {
      toast(err.message, { type: "error" });
    },
  });

  return { updateCartItem, isPending };
}
