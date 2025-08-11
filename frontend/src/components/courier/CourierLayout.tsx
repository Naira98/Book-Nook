import { Outlet } from "react-router-dom";
import CourierNavbar from "./CourierNavbar";
import { connectWebSocket } from "../../services/websocketService";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "../../hooks/auth/useGetMe";

const CourierLayout = () => {
  const queryClient = useQueryClient();
  const { me } = useGetMe();
  function onSocketOpen() {
    console.log("Socket opened");
  }
  function onSocketMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    console.log(data, "Socket data");
    if (
      data &&
      (data.message == "order_created" ||
        (data.message == "order_status_updated" && data.courier_id != me?.id))
    ) {
      queryClient.invalidateQueries({ queryKey: ["allStaffOrders"] });
    }
  }
  function onSocketClose() {
    console.log("Socket closed");
  }
  function onSocketError(event: Event) {
    console.error("Socket error:", event);
  }
  connectWebSocket(onSocketOpen, onSocketMessage, onSocketClose, onSocketError);
  return (
    <div className="min-h-screen bg-gray-50">
      <CourierNavbar />
      <Outlet />
    </div>
  );
};

export default CourierLayout;
