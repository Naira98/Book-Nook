import { Spinner } from "flowbite-react";
import { Calendar, ClipboardClock, Clock, Store, Truck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserOrders } from "../../hooks/orders/useGetUserOrders";
import { useGetUserReturnOrders } from "../../hooks/orders/useGetUserReturnOrders";
import { PickUpType } from "../../types/Orders";
import { formatClock } from "../../utils/formatting";
import { groupOrdersByDate } from "../../utils/orders";
import { groupReturnOrdersByDate } from "../../utils/returnOrders";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "returnOrders">(
    "orders",
  );
  const navigate = useNavigate();
  const { orders, isPending: isOrdersPending } = useGetUserOrders();
  const { returnOrders, isPending: isReturnOrdersPending } =
    useGetUserReturnOrders();
  const groupedOrders = groupOrdersByDate(orders?.orders || []);
  const groupedReturnOrders = groupReturnOrdersByDate(
    returnOrders?.return_orders || [],
  );

  const getStatusIcon = (pickedType: PickUpType) => {
    switch (pickedType) {
      case "SITE":
        return <Store className="text-primary w-6" />;
      case "COURIER":
        return <Truck className="text-primary w-6" />;
    }
  };

  const statusFormat = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="text-secondary text-sm">created</span>;
      case "ON_THE_WAY":
        return <span className="animate-on-the-way text-sm">On the Way</span>;
      case "PICKED_UP":
        return <span className="text-success text-sm">Picked Up</span>;
      case "PROBLEM":
        return <span className="text-error text-sm">Problem</span>;
      default:
        return status;
    }
  };

  if (isOrdersPending && activeTab === "orders") return <Spinner />;
  if (isReturnOrdersPending && activeTab === "returnOrders") return <Spinner />;

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">Your Orders</h1>
      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`cursor-pointer px-1 pb-4 font-semibold transition-colors duration-200 ${
              activeTab === "orders"
                ? "text-secondary border-secondary border-b"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("returnOrders")}
            className={`cursor-pointer px-1 pb-4 font-semibold transition-colors duration-200 ${
              activeTab === "returnOrders"
                ? "text-secondary border-secondary border-b"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Return Orders
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {groupedOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ClipboardClock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p>No Orders found</p>
            </div>
          ) : (
            groupedOrders.map(([date, ordersPerDay]) => (
              <div key={date} className="m-0">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-400">
                      {date}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {ordersPerDay.map((order) => (
                    <div
                      onClick={() => navigate(`/orders-history/${order.id}`)}
                      key={order.id}
                      className="cursor-pointer px-6 py-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.pickup_type)}
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              #{order.id} {statusFormat(order.status)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatClock(order.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0">
                          {order.total_price} EGP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "returnOrders" && (
        <div className="space-y-6">
          {groupedReturnOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ClipboardClock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p>No Return Orders found</p>
            </div>
          ) : (
            groupedReturnOrders.map(([date, returnOrdersPerDay]) => (
              <div key={date} className="m-0">
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-400">
                      {date}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {returnOrdersPerDay.map((order) => (
                    <div
                      onClick={() => navigate(`/orders-history/${order.id}`)}
                      key={order.id}
                      className="cursor-pointer px-6 py-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-1 items-center gap-4">
                          <div className="flex-shrink-0">
                            {getStatusIcon(order.pickup_type)}
                          </div>

                          {/* Description */}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              #{order.id} {statusFormat(order.status)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{formatClock(order.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0">
                          {order.total_price} EGP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default OrdersPage;
