import { useQueryClient } from "@tanstack/react-query";
import { LibraryBig, Package } from "lucide-react";
import { Outlet } from "react-router-dom";
import { connectWebSocket } from "../../services/websocketService";
import type {
  AllOrdersResponse,
  Order,
  OrderStatus,
  ReturnOrder,
  ReturnOrderStatus,
} from "../../types/Orders";
import Sidebar from "../layouts/Sidebar";

const navItems = [
  { to: "/staff/books", label: "Books", icon: <LibraryBig /> },
  { to: "/staff/orders", label: "Orders", icon: <Package /> },
];

const EmployeeLayout = () => {
  const queryClient = useQueryClient();

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

  function changeOrderStatus(orderId: number, status: OrderStatus) {
    queryClient.setQueryData(
      ["allStaffOrders"],
      (oldData: AllOrdersResponse) => {
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.orders = newData.orders.map((order) =>
            order.id === orderId ? { ...order, status: status } : order,
          );
          return newData;
        }
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
        if (oldData != undefined) {
          const newData = { ...oldData };
          newData.return_orders = oldData.return_orders.map((order) =>
            order.id === returnOrderId ? { ...order, status: status } : order,
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
    if (
      data &&
      (data.message == "return_order_created" ||
        data.message == "courier_return_order")
    ) {
      addNewReturnOrder(data.return_order);
    }
    if (data && data.message == "order_status_updated") {
      changeOrderStatus(data.order_id, data.status);
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
      <main className="mx-auto h-screen max-w-7xl flex-1 overflow-auto px-8 py-16 sm:px-12 lg:px-16">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
