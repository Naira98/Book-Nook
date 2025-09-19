import { Outlet } from "react-router-dom";
import { connectWebSocket } from "../../services/websocketService";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "../../hooks/auth/useGetMe";

const ClientSocketProvider = () => {
  const queryClient = useQueryClient();
  const { me } = useGetMe();

  function onSocketOpen() {
    console.log("Socket opened");
  }

  function onSocketMessage(event: MessageEvent) {
    const newNotification = JSON.parse(event.data);

    queryClient.setQueryData(
      ["notifications", me?.id],
      (oldData: Notification[] | undefined) => {
        if (oldData === undefined) return oldData;
        const updated = [newNotification, ...oldData];
        return updated.slice(0, 5);
      },
    );

    switch (newNotification.type) {
      case "ORDER_STATUS_UPDATE":
        queryClient.invalidateQueries({
          queryKey: ["userOrders", me?.id],
        });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        break;

      case "RETURN_ORDER_STATUS_UPDATE":
        queryClient.invalidateQueries({
          queryKey: ["userOrders", me?.id],
        });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        break;

      case "WALLET_UPDATED":
        queryClient.invalidateQueries({ queryKey: ["me"] });
        break;

      default:
        console.warn("Unknown notification type:", newNotification.type);
        break;
    }
  }
  function onSocketClose() {
    console.log("Socket closed");
  }

  function onSocketError(event: Event) {
    console.error("Socket error:", event);
  }

  connectWebSocket(onSocketOpen, onSocketMessage, onSocketClose, onSocketError);
  return <Outlet />;
};

export default ClientSocketProvider;
