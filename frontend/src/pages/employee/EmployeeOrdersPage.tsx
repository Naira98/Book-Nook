import {
  AlertTriangle,
  CheckCircle,
  ClockPlus,
  Info,
  Loader,
} from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import NoOrders from "../../components/courier/OrderPage/NoOrders";
import EmployeeOrderCard from "../../components/shared/orderCards/EmployeeOrderCard";
import { useGetAllOrders } from "../../hooks/orders/useGetAllOrders";
import {
  PickUpType,
  type AllOrdersResponse,
  type OrderStatus,
  type ReturnOrderStatus,
} from "../../types/Orders";

const EmployeeOrdersPage = () => {
  const { allOrders, isPending } = useGetAllOrders(PickUpType.SITE);
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "Pending Pickups";

  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const orders: AllOrdersResponse | null = useMemo(
    () => allOrders || null,
    [allOrders],
  );

  const displayOrders = useMemo(() => {
    if (!orders) return null;

    switch (activeTab) {
      case "Pending Pickups":
        return {
          orders: orders.orders?.filter((o) => o.status === "CREATED"),
          return_orders: [],
        };
      case "Pending Returns":
        return {
          orders: [],
          return_orders: orders.return_orders?.filter(
            (o) => o.status === "CREATED" || o.status === "PICKED_UP",
          ),
        };
      case "Quality Check":
        return {
          orders: [],
          return_orders: orders.return_orders?.filter(
            (o) => o.status === "CHECKING",
          ),
        };
      case "Done Orders":
        return {
          orders: orders.orders.filter((o) => o.status === "PICKED_UP"),
          return_orders: orders.return_orders.filter(
            (o) => o.status === "DONE",
          ),
        };
      default:
        return { orders: [], return_orders: [] };
    }
  }, [activeTab, orders]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-primary mb-8 text-3xl font-bold">
        Orders Management
      </h1>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`cursor-pointer px-1 pb-4 font-semibold capitalize transition-colors duration-200 ${
                activeTab === tab
                  ? "text-primary border-primary border-b"
                  : "text-layout/80 hover:text-primary"
              }`}
              onClick={() => {
                setActiveTab(tab);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      {isPending ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {!displayOrders?.orders?.length &&
          !displayOrders?.return_orders?.length ? (
            <NoOrders activeTab={activeTab} />
          ) : (
            <>
              {displayOrders?.orders?.map((order) => (
                <EmployeeOrderCard
                  key={order.id}
                  order={order}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  orderType="order"
                />
              ))}

              {displayOrders?.return_orders?.map((returnOrder) => (
                <EmployeeOrderCard
                  key={returnOrder.id}
                  order={returnOrder}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
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

export default EmployeeOrdersPage;

const tabs = [
  "Pending Pickups",
  "Pending Returns",
  "Quality Check",
  "Done Orders",
];


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