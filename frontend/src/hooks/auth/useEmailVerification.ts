import { useMutation } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
export function useEmailVerification() {
  const { mutate: emailVerification, isPending } = useMutation({
    mutationFn: async (values: { token: string }) => {
      return await apiReq("POST", "/auth/verify-email", values);
    },
  });

  return { emailVerification, isPending };
}
