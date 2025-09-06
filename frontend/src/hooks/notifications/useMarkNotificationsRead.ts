import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiReq from "../../services/apiReq";
import { useGetMe } from "../auth/useGetMe";
import type { Notifications } from "../../types/Notifications";

export const useMarkNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { me } = useGetMe();

  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationIds: number[]) =>
      await apiReq("PATCH", "/notifications/mark-read", {
        notification_ids: notificationIds,
      }),

    onSuccess: (_, notificationIds) => {
      queryClient.setQueryData(
        ["notifications", me?.id],
        (oldData: Notifications[] | undefined) => {
          if (oldData === undefined) return oldData;
          return oldData.map((n) =>
            notificationIds.includes(n.id)
              ? { ...n, read_at: new Date().toISOString() }
              : n,
          );
        },
      );
    },
  });
  return { markAsRead };
};
