import { useMutation } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { toast } from "react-toastify";

export const useCreateCheckoutSession = () => {
  const { mutate: createCheckoutSession, isPending } = useMutation({
    mutationFn: async (amount: number) => {
      return await apiReq("POST", "/wallet/create-checkout-session", {
        amount: String(amount),
      });
    },
    onSuccess: (checkoutPageUrl: { url: string }) => {
      window.location.href = checkoutPageUrl.url;
    },
    onError: (error) => {
      console.error("Error creating checkout session:", error);
      toast(error.message, {
        type: "error",
      });
    },
  });

  return { createCheckoutSession, isPending };
};
