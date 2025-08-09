import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { ResetPasswordValues } from "../../types/auth";
import { useNavigate } from "react-router-dom";

export const useResetPassword = () => {
  const navigate = useNavigate();

  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      await apiReq("POST", "/auth/reset-password", values);
    },
    onSuccess: () => {
      navigate("/login", { replace: true });
      toast("Password reset successfully", { type: "success" });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { resetPassword, isPending };
};
