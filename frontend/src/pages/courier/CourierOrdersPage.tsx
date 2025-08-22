import {
  AlertTriangle,
  CheckCircle,
  ClockPlus,
  Info,
  Loader,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoOrders from "../../components/courier/OrderPage/NoOrders";
import CourierOrderCard from "../../components/shared/orderCards/CourierOrderCard";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useGetAllOrders } from "../../hooks/orders/useGetAllOrders";
import {
  PickUpType,
  type AllOrdersResponse,
  type OrderStatus,
  type ReturnOrderStatus,
} from "../../types/Orders";

const CourierOdersPage = () => {
  const { allOrders, isPending } = useGetAllOrders(PickUpType.COURIER);
  const [newOrderAlert] = useState<string[]>([]);
  const { me } = useGetMe();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "Pending Orders";
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const orders: AllOrdersResponse | null = useMemo(
    () => allOrders || null,
    [allOrders],
  );

  const displayOrders = useMemo(() => {
    if (!orders) return null;

    if (activeTab === "Pending Orders") {
      return {
        orders: orders.orders?.filter((o) => o.status === "CREATED"),
        return_orders: [],
      };
    } else if (activeTab === "Pending Returns") {
      return {
        orders: [],
        return_orders: orders.return_orders?.filter(
          (o) => o.status === "CREATED",
        ),
      };
    } else if (activeTab === "My Returns") {
      return {
        orders: [],
        return_orders: orders.return_orders?.filter(
          (o) => o.courier_id === me?.id,
        ),
      };
    } else if (activeTab === "My Orders") {
      return {
        orders: orders.orders?.filter((o) => o.courier_id === me?.id),
        return_orders: [],
      };
    }
  }, [activeTab, orders, me?.id]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
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
                <CourierOrderCard
                  key={order.id}
                  order={order}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  orderType="order"
                />
              ))}

              {displayOrders?.return_orders?.map((returnOrder) => (
                <CourierOrderCard
                  key={returnOrder.id}
                  order={returnOrder}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  orderType="return_order"
                />
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default CourierOdersPage;

const tabs = ["Pending Orders", "Pending Returns", "My Orders", "My Returns"];

const getStatusColor = (status: OrderStatus | ReturnOrderStatus) => {
  switch (status) {
    case "CREATED":
      return "bg-blue-100 text-primary";
    case "ON_THE_WAY":
    case "CHECKING":
      return "bg-orange-100 text-orange-800";
    case "PICKED_UP":
    case "DONE":
      return "bg-green-100 text-green-800";
    case "PROBLEM":
      return "bg-red-100 text-red-800";
    default:
      return "bg-accent text-layout";
  }
};

const getStatusIcon = (status: OrderStatus | ReturnOrderStatus) => {
  switch (status) {
    case "CREATED":
      return <ClockPlus size={16} />;
    case "PICKED_UP":
    case "DONE":
      return <CheckCircle size={16} />;
    case "PROBLEM":
      return <AlertTriangle size={16} />;
    case "CHECKING":
      return <Loader size={16} />;
    default:
      return <Info size={16} />;
  }
};
