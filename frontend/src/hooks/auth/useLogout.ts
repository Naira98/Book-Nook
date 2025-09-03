import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiReq from "../../services/apiReq";
import { disconnectWebSocket } from "../../services/websocketService";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      return await apiReq("POST", "/auth/logout");
    },
    onSuccess: () => {
      disconnectWebSocket();
      queryClient.setQueryData(["me"], null);
      navigate("/login", { replace: true });
    },
    onError: (err) => {
      console.log(err);
      toast(err.message, { type: "error" });
    },
  });

  return { logout };
}
