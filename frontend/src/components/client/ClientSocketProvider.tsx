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
    const newData = JSON.parse(event.data);
    queryClient.setQueryData(
      ["notifications", me?.id],
      (oldData: Notification[] | undefined) => {
        if (oldData === undefined) return oldData;
        const updated = [newData, ...oldData];
        return updated.slice(0, 5);
      },
    );
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
