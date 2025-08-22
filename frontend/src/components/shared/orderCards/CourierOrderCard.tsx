import {
  BookOpen,
  CircleArrowOutUpRight,
  MapPin,
  Undo2,
  User
} from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMe } from "../../../hooks/auth/useGetMe";
import { useChangeOrderStatus } from "../../../hooks/orders/useChangeOrderStatus";
import { useChangeReturnOrderStatus } from "../../../hooks/orders/useChangeReturnOrderStatus";
import {
  OrderStatus,
  ReturnOrderStatus,
  type Order,
  type ReturnOrder,
} from "../../../types/Orders";
import { fromatDateTime } from "../../../utils/formatting";
import MainButton from "../buttons/MainButton";

type CourierOrderCardProps = {
  getStatusColor: (status: OrderStatus | ReturnOrderStatus) => string;
  getStatusIcon: (status: OrderStatus | ReturnOrderStatus) => ReactNode
  order: Order | ReturnOrder;
  orderType: "order" | "return_order";
};

export default function CourierOrderCard({
  order,
  getStatusColor,
  getStatusIcon,
  orderType,
}: CourierOrderCardProps) {
  const navigate = useNavigate();
  const { me } = useGetMe();
  const isCourierOrder = order.courier_id === me!.id;
  const isReturnOrder = orderType === "return_order";

  const { changeOrderStatus, isPending: isChangingOrderStatus } =
    useChangeOrderStatus();
  const { changeReturnOrderStatus, isPending: isChangingReturnStatus } =
    useChangeReturnOrderStatus();

  const handleStatusChange = () => {
    if (isReturnOrder) {
      if (order.status === ReturnOrderStatus.CREATED) {
        changeReturnOrderStatus({
          ...(order as ReturnOrder),
          return_order_id: order.id,
          status: ReturnOrderStatus.ON_THE_WAY,
        });
      } else if (order.status === ReturnOrderStatus.ON_THE_WAY) {
        changeReturnOrderStatus({
          ...(order as ReturnOrder),
          return_order_id: order.id,
          status: ReturnOrderStatus.PICKED_UP,
        });
      }
    } else {
      if (order.status === OrderStatus.CREATED) {
        changeOrderStatus({
          ...(order as Order),
          order_id: order.id,
          status: OrderStatus.ON_THE_WAY,
        });
      } else if (order.status === OrderStatus.ON_THE_WAY) {
        changeOrderStatus({
          ...(order as Order),
          order_id: order.id,
          status: OrderStatus.PICKED_UP,
        });
      }
    }
  };

  const onDetailsClick = () => {
    const path = isReturnOrder
      ? `/courier/return-order/${order.id}`
      : `/courier/order/${order.id}`;
    navigate(path);
  };

  const getActionButtonLabel = () => {
    if (isReturnOrder) {
      if (order.status === ReturnOrderStatus.CREATED) {
        return "Start Return Pickup";
      }
      if (order.status === ReturnOrderStatus.ON_THE_WAY) {
        return "Confirm Return Pickup";
      }
      return "Return Complete";
    }

    // Logic for standard orders
    if (order.status === OrderStatus.CREATED) {
      return "Start Pickup";
    }
    if (order.status === OrderStatus.ON_THE_WAY) {
      return "Confirm Drop-off";
    }
    return "Order Complete";
  };

  const shouldShowActionButton =
    order.status === OrderStatus.CREATED ||
    order.status === OrderStatus.ON_THE_WAY ||
    order.status === ReturnOrderStatus.CREATED ||
    order.status === ReturnOrderStatus.ON_THE_WAY;

  const isPending = isChangingOrderStatus || isChangingReturnStatus;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {orderType === "order" ? (
            <CircleArrowOutUpRight size={20} className="text-primary" />
          ) : (
            <Undo2 size={20} className="text-layout" />
          )}{" "}
          <h3 className="text-primary text-lg font-semibold">
            {isReturnOrder ? "Return Order " : "Order "}
            <span className="text-layout text-sm font-normal">#{order.id}</span>
          </h3>
        </div>
        <div
          className={`flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
            order.status,
          )}`}
        >
          <span>{getStatusIcon(order.status)}</span>
          <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-100" />

      {/* Details Section */}
      <div className="space-y-3">
        {order.user.first_name && (
          <div className="text-primary flex items-center">
            <User size={16} className="text-secondary mr-2 flex-shrink-0" />
            <p className="text-sm">
              <span className="text-layout font-medium">Customer:</span>{" "}
              <span className="text-primary font-semibold">
                {order.user.first_name} {order.user.last_name}
              </span>
            </p>
          </div>
        )}

        <div className="text-primary flex items-center">
          <MapPin size={16} className="text-secondary mr-2 flex-shrink-0" />
          <p className="text-sm">
            <span className="text-layout font-medium">Address:</span>{" "}
            <span className="text-primary font-semibold">{order.address}</span>
          </p>
        </div>

        <div className="text-primary flex items-center">
          <BookOpen size={16} className="text-secondary mr-2 flex-shrink-0" />
          <p className="text-sm">
            <span className="text-layout font-medium">Books:</span>{" "}
            <span className="text-primary font-semibold">
              {order.number_of_books}
            </span>
          </p>
        </div>
      </div>

      <hr className="my-4 border-t border-gray-100" />

      {/* Footer Section */}
      <div className="flex items-center justify-between">
        <span className="text-layout text-xs">
          {fromatDateTime(order.created_at)}
        </span>
        <div className="flex space-x-2">
          {/* Details Button - Always visible for courier's own orders */}
          {isCourierOrder && (
            <MainButton
              onClick={onDetailsClick}
              className="border-layout !bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
            >
              Details
            </MainButton>
          )}

          {/* Action Button - Conditional based on status */}
          {shouldShowActionButton && (
            <MainButton
              onClick={handleStatusChange}
              loading={isPending}
              className="h-9 min-w-[190px]"
            >
              {getActionButtonLabel()}
            </MainButton>
          )}
        </div>
      </div>
    </div>
  );
}
