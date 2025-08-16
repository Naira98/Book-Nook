import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";

export function useApplyPromoCode() {
  const { mutate: applyPromoCode, isPending } = useMutation({
    mutationFn: async (values: { code: string }) => {
      return await apiReq("POST", "/promo-codes/active", values);
    },
    onSuccess: () => {},
    onError: (err) => {
      toast(err.message, { type: "error" });
    },
  });

  return { applyPromoCode, isPending };
}
