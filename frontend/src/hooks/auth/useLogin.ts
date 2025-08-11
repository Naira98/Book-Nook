import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import type { LoginFormData } from "../../types/auth";
import type { IUser } from "../../types/User";

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending } = useMutation({
    mutationFn: async (values: LoginFormData) => {
      return await apiReq("POST", "/auth/login", values);
    },
    onSuccess: (user: IUser) => {
      queryClient.setQueryData(["me"], user);
      if (user.role == "CLIENT") {
        navigate("/", { replace: true });
      } else if (user.role === "MANAGER") {
        navigate("/manager/dashboard", { replace: true });
      } else if (user.role === "EMPLOYEE") {
        navigate("/staff/books", { replace: true });
      } else if (user.role === "COURIER") {
        navigate("/courier/orders", { replace: true });
      }
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { login, isPending };
}
