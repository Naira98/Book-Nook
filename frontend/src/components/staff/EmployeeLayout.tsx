import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { LibraryBig, Package } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { connectWebSocket } from "../../services/websocketService";
import type {
  AllOrdersResponse,
  Order,
  ReturnOrder,
  ReturnOrderStatus,
} from "../../types/Orders";

const navItems = [
  { to: "/staff/books", label: "Books", icon: <LibraryBig /> },
  { to: "/employee/orders", label: "Orders", icon: <Package /> },
];

const EmployeeLayout = () => {
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

  function removeAccepetedOrder(orderId: number) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (!oldData) return oldData;
        const newData = { ...oldData };
        newData.orders = oldData.orders.filter((order) => order.id !== orderId);
        return newData;
      },
    );
  }

  function updateReturnOrderStatus(
    returnOrderId: number,
    status: ReturnOrderStatus,
  ) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (!oldData) return oldData;
        const newData = { ...oldData };
        newData.return_orders = oldData.return_orders.map((order) =>
          order.id === returnOrderId ? { ...order, status: status } : order,
        );
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
    if (
      data &&
      (data.message == "return_order_created" ||
        data.message == "courier_return_order")
    ) {
      addNewReturnOrder(data.return_order);
    }
    if (data && data.message == "order_status_updated") {
      removeAccepetedOrder(data.order_id);
    }

    if (data && data.message == "return_order_status_updated") {
      updateReturnOrderStatus(data.return_order_id, data.status);
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
    <div className="flex">
      <Sidebar navItems={navItems} />
      <main className="h-screen flex-1 overflow-auto bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
