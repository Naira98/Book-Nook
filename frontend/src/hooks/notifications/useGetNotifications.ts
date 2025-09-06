import { useQuery } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import type { Notifications } from "../../types/Notifications";
import { useGetMe } from "../auth/useGetMe";

export const useGetNotifications = () => {
  const { me } = useGetMe();

  const {
    data: notifications,
    isPending,
    error,
  } = useQuery<Notifications[]>({
    queryKey: ["notifications", me?.id],
    queryFn: async () => await apiReq("GET", "/notifications/latest"),
    staleTime: 60 * 1000 * 5,
  });

  return { notifications, isPending, error };
};
