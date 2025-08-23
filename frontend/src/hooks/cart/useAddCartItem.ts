import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { IUser } from "../../types/User";
import { toast } from "react-toastify";

interface AddToCartRequestBody {
  book_details_id: number;
  quantity: number;
  borrowing_weeks: number;
}

export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  const userId = queryClient.getQueryData<IUser>(["me"])!.id;

  const { mutate: addCartItem, isPending } = useMutation({
    mutationFn: async (values: AddToCartRequestBody) => {
      return await apiReq("POST", "/cart", values);
    },
    onSuccess: () => {
      const cartItems = queryClient.getQueryData(["cartItems", userId]);

      if (cartItems) {
        queryClient.invalidateQueries({ queryKey: ["cartItems", userId] });
      }
    },
    onError: (err) => {
      console.error(err);
      toast(err.message, { type: "error" });
    },
  });

  return { addCartItem, isPending };
};
