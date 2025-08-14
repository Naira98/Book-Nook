import { Outlet } from "react-router-dom";
import CourierNavbar from "./CourierNavbar";
import { connectWebSocket } from "../../services/websocketService";
import { useQueryClient } from "@tanstack/react-query";
import type { AllOrdersResponse, Order, ReturnOrder } from "../../types/Orders";

const CourierLayout = () => {
  const queryClient = useQueryClient();

  function addNewOrder(order: Order) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (!oldData) return oldData;
        const newData = { ...oldData };
        newData.orders = [order, ...oldData.orders];
        return newData;
      },
    );
  }

  function addNewReturnOrder(returnOrder: ReturnOrder) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (!oldData) return oldData;
        const newData = { ...oldData };
        newData.return_orders = [returnOrder, ...oldData.return_orders];
        return newData;
      },
    );
  }

  function onSocketOpen() {
    console.log("Socket opened");
  }

  function onSocketMessage(event: MessageEvent) {
    const data = JSON.parse(event.data);
    if (data && data.message == "order_created") {
      addNewOrder(data.order);
    }
    if (data && data.message == "return_order_created") {
      addNewReturnOrder(data.return_order);
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
