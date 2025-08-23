import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { Settings } from "../../types/Settings";
import { toast } from "react-toastify";

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<Settings, Error, Partial<Settings>>({
    mutationFn: async (updatedSettings) => {
      const response = await apiReq(
        "PATCH",
        "/manager/settings",
        updatedSettings,
      );
      return response as Settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error) => {
      console.error("Error updating settings:", error);
      toast.error("Error updating settings. Please try again.", {
        type: "error",
      });
    },
  });
}
