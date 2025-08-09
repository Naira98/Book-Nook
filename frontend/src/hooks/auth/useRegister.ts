import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { RegisterFormData } from "../../types/auth";
import type { Dispatch, SetStateAction } from "react";

export function useRegister(
  setEmailSent: Dispatch<SetStateAction<boolean>>,
  setResendCountdown: Dispatch<SetStateAction<number>>,
) {

  const { mutate: register, isPending } = useMutation({
    mutationFn: async (values: RegisterFormData) => {
      return await apiReq("POST", "/auth/register", values);
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

  return { register, isPending };
}
