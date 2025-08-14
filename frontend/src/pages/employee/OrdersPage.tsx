import { useState, useMemo } from "react";
import { useGetAllOrders } from "../../hooks/orders/useGetAllOrders";
import {
  PickUpType,
  type AllOrdersResponse,
  type OrderStatus,
  type ReturnOrderStatus,
} from "../../types/Orders";
import OrderCard from "../../components/shared/orderCards/OrderCard";
import ReturnOrderCard from "../../components/shared/orderCards/ReturnOrderCard";
import NoOrders from "../../components/courier/OrderPage/NoOrders";

const StaffOrdersPage = () => {
  const { allOrders, isPending } = useGetAllOrders(PickUpType.SITE);
  const [activeTab, setActiveTab] = useState("Pending orders");
  const [newOrderAlert] = useState<string[]>([]);
  const orders: AllOrdersResponse | null = useMemo(
    () => allOrders || null,
    [allOrders],
  );

  const getStatusColor = (status: OrderStatus | ReturnOrderStatus) => {
    switch (status) {
      case "CREATED":
        return "bg-amber-50 text-amber-700";
      case "PICKED_UP":
        return "bg-green-50 text-green-700";
      case "PROBLEM":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getStatusIcon = (status: OrderStatus | ReturnOrderStatus) => {
    switch (status) {
      case "CREATED":
        return "🕒";
      case "PICKED_UP":
        return "✅";
      case "PROBLEM":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const displayOrders = useMemo(() => {
    if (!orders) return null;

    if (activeTab === "my return orders") {
      return {
        orders: [],
        return_orders: orders.return_orders?.filter(
          (o) => o.status !== "CREATED",
        ),
      };
    }

    if (activeTab === "my orders") {
      return {
        orders: orders.orders?.filter((o) => o.status !== "CREATED"),
        return_orders: [],
      };
    }

    return activeTab === "Pending orders"
      ? {
          orders: orders.orders?.filter((o) => o.status === "CREATED"),
          return_orders: [],
        }
      : {
          orders: [],
          return_orders: orders.return_orders?.filter(
            (o) => o.status === "CREATED" || o.status === "PICKED_UP",
          ),
        };
  }, [activeTab, orders]);

  return (
    <main className="mx-auto max-w-6xl py-6 md:px-4">
      {/* Tabs */}
      <div className="mb-6 flex space-x-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium capitalize transition-colors ${activeTab === tab ? "text-secondary bg-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => {
              setActiveTab(tab);
            }}
          >
            {tab}
            {activeTab !== tab &&
              newOrderAlert.some((id) => id.includes("delivery")) && (
                <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-500"></span>
              )}
          </button>
        ))}
      </div>

      {/* Order List */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {!displayOrders?.orders?.length &&
          !displayOrders?.return_orders?.length ? (
            <NoOrders activeTab={activeTab} />
          ) : (
            <>
              {displayOrders?.orders?.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  pickUpType={PickUpType.SITE}
                />
              ))}

              {displayOrders?.return_orders?.map((returnOrder) => (
                <ReturnOrderCard
                  key={returnOrder.id}
                  returnOrder={returnOrder}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  pickUpType={PickUpType.SITE}
                  view="EMPLOYEE"
                />
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default StaffOrdersPage;

const tabs = [
  "Pending orders",
  "return orders",
  "my orders",
  "my return orders",
];
