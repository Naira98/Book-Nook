import { useMutation } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { toast } from "react-toastify";

export function useEmailVerification() {
  const { mutate: emailVerification, isPending } = useMutation({
    mutationFn: async (values: { token: string }) => {
      return await apiReq("POST", "/auth/verify-email", values);
    },
    onError: (e) => {
      console.error(e);
      toast(e.message, { type: "error" });
    },
  });

  return { emailVerification, isPending };
}
