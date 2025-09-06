import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { Settings } from "../../types/Settings";

export function useGetSettings() {
  const {
    data: settings,
    isPending,
    error,
  } = useQuery<Settings, Error>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await apiReq("GET", "/books/settings");
      return response as Settings;
    },
    staleTime: 60 * 1000 * 60,
  });

  return { settings, isPending, error };
}
