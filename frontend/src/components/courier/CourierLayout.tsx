import { Outlet } from "react-router-dom";
import CourierNavbar from "./CourierNavbar";
import { connectWebSocket } from "../../services/websocketService";
import { useQueryClient } from "@tanstack/react-query";
import type { AllOrdersResponse, Order, ReturnOrder } from "../../types/Orders";
import { useGetMe } from "../../hooks/auth/useGetMe";

const CourierLayout = () => {
  const queryClient = useQueryClient();
  const { me } = useGetMe();

  function addNewOrder(order: Order) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.orders = [order, ...oldData.orders];
          return newData;
        }
      },
    );
  }

  function addNewReturnOrder(returnOrder: ReturnOrder) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.return_orders = [returnOrder, ...oldData.return_orders];
          return newData;
        }
      },
    );
  }

  function removeAccepetedOrder(orderId: number) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.orders = oldData.orders.filter(
            (order) => order.id !== orderId,
          );
          return newData;
        }
      },
    );
  }

  function removeAccepetedReturnOrder(returnOrderId: number) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.return_orders = oldData.return_orders.filter(
            (order) => order.id !== returnOrderId,
          );
          return newData;
        }
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

    if (
      data &&
      data.message == "order_status_updated" &&
      data.courier_id != me?.id
    ) {
      removeAccepetedOrder(data.order_id);
    }

    if (
      data &&
      data.message == "return_order_status_updated" &&
      data.courier_id != me?.id
    ) {
      removeAccepetedReturnOrder(data.return_order_id);
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
