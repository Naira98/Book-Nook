import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { PromoCodeUpdate } from "../../types/promoCode";

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();

  const { mutate: updatePromoCode, isPending } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PromoCodeUpdate }) => {
      return await apiReq("PATCH", `/promo-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
      toast("Promo code updated successfully!", { type: "success" });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { updatePromoCode, isPending };
}