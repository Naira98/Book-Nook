import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { PromoCodeCreate } from "../../types/promoCode";

export function useCreatePromoCode() {
  const queryClient = useQueryClient();

  const { mutate: createPromoCode, isPending } = useMutation({
    mutationFn: async (values: PromoCodeCreate) => {
      return await apiReq("POST", "/promo-codes", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
      toast("Promo code created successfully!", { type: "success" });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { createPromoCode, isPending };
}