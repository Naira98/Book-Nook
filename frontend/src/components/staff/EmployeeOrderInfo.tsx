import {
  type Order,
  OrderStatus,
  type ReturnOrder,
  ReturnOrderStatus,
} from "../../types/Orders";
import { fromatDateTime } from "../../utils/formatting";

interface OrderInfoProps {
  order: Order | ReturnOrder;
  isOrder: boolean;
}

const OrderInfo = ({ order, isOrder }: OrderInfoProps) => {
  const getStatusColor = (status: OrderStatus | ReturnOrderStatus) => {
    switch (status) {
      case OrderStatus.CREATED:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.PICKED_UP:
        return "bg-success text-white";
      default:
        return "bg-accent text-layout";
    }
  };
  return (
    <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
      <h2 className="text-primary mb-4 text-2xl font-bold">
        {isOrder ? "Order" : "Return Order"} Details #{order.id}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer Information Section */}
        <div>
          <h3 className="text-primary mb-2 text-xl font-semibold">
            Customer Information
          </h3>
          <div className="text-layout space-y-2">
            <p>
              <span className="font-semibold">Name:</span>{" "}
              {order.user.first_name} {order.user.last_name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {order.user.email}
            </p>
          </div>
        </div>

        {/* Order Information Section */}
        <div>
          <h3 className="text-primary mb-2 text-xl font-semibold">
            Order Information
          </h3>
          <div className="text-layout space-y-2">
            <p>
              <span className="font-semibold">Order Date:</span>{" "}
              {fromatDateTime(order.created_at)}
            </p>
            <p>
              <span className="font-semibold">Status:</span>
              <span
                className={`ml-2 rounded-full px-2 py-1 text-xs font-semibold uppercase ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            </p>
            <p>
              <span className="font-semibold">Number of books:</span>{" "}
              {order.number_of_books}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
