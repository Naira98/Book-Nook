import { useMutation } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { EmailFormValues } from "../../types/auth";

export const useForgetPassword = (
  setEmailSent: Dispatch<SetStateAction<boolean>>,
  setResendCountdown: Dispatch<SetStateAction<number>>,
) => {
  const { mutate: forgetPassword, isPending } = useMutation({
    mutationFn: async (values: EmailFormValues) => {
      return await apiReq(
        "POST",
        "/auth/forget-password",
        values,
      );
    },
    onSuccess: () => {
      setEmailSent(true);
      setResendCountdown(30);
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { forgetPassword, isPending };
};
