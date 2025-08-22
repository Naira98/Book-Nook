import { BookOpen, CircleArrowOutUpRight, Undo2, User } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useChangeOrderStatus } from "../../../hooks/orders/useChangeOrderStatus";
import { useChangeReturnOrderStatus } from "../../../hooks/orders/useChangeReturnOrderStatus";
import {
  OrderStatus,
  ReturnOrderStatus,
  type Order,
  type ReturnOrder,
  type changeOrderStatusRequest,
} from "../../../types/Orders";
import MainButton from "../buttons/MainButton";

type EmployeeOrderCardProps = {
  getStatusIcon: (status: OrderStatus | ReturnOrderStatus) => ReactNode;
  order: Order | ReturnOrder;
  getStatusColor: (status: OrderStatus | ReturnOrderStatus) => string;
  orderType: "order" | "return_order";
};

const EmployeeOrderCard = ({
  order,
  getStatusIcon,
  getStatusColor,
  orderType,
}: EmployeeOrderCardProps) => {
  const navigate = useNavigate();
  const { changeOrderStatus, isPending } = useChangeOrderStatus();
  const { changeReturnOrderStatus, isPending: isChangingReturnStatus } =
    useChangeReturnOrderStatus();

  const handleChangeOrderStatus = (values: changeOrderStatusRequest) => {
    changeOrderStatus(values);
  };

  const handleReturnStatusChange = (newStatus: ReturnOrderStatus) => {
    changeReturnOrderStatus({
      ...(order as ReturnOrder),
      return_order_id: order.id,
      status: newStatus,
    });
  };

  const isReturnOrderAndCreated =
    orderType === "return_order" && order.status === ReturnOrderStatus.CREATED;
  const isReturnOrderAndPickedUp =
    orderType === "return_order" &&
    order.status === ReturnOrderStatus.PICKED_UP;
  const isStandardOrderAndCreated =
    orderType === "order" && order.status === OrderStatus.CREATED;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {orderType == "order" ? (
            <CircleArrowOutUpRight size={20} className="text-primary" />
          ) : (
            <Undo2 size={20} className="text-layout" />
          )}{" "}
          <h3 className="text-primary text-lg font-semibold">
            {orderType === "order" ? "Order " : "Return Order "}
            <span className="text-layout text-sm font-normal">#{order.id}</span>
          </h3>
        </div>
        <div
          className={`flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.status)}`}
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
              <span className="text-layout font-medium">Owner:</span>{" "}
              <span className="text-primary font-semibold">
                {order.user.first_name} {order.user.last_name}
              </span>
            </p>
          </div>
        )}

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
          {new Date(order.created_at).toLocaleString()}
        </span>
        <div className="flex space-x-2">
          {isReturnOrderAndCreated ? (
            <div className="flex space-x-2">
              <MainButton
                onClick={() => navigate(`/staff/return-orders/${order.id}`)}
                className="border-layout !bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
              >
                Details
              </MainButton>
              <MainButton
                onClick={() =>
                  handleReturnStatusChange(ReturnOrderStatus.CHECKING)
                }
                loading={isChangingReturnStatus}
                className="h-9 min-w-[140px]"
              >
                Approve Return
              </MainButton>
            </div>
          ) : isReturnOrderAndPickedUp ? (
            <div className="flex space-x-2">
              <MainButton
                onClick={() => navigate(`/staff/return-orders/${order.id}`)}
                className="border-layout !bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
              >
                Details
              </MainButton>
              <MainButton
                onClick={() =>
                  handleReturnStatusChange(ReturnOrderStatus.CHECKING)
                }
                loading={isChangingReturnStatus}
                className="h-9 min-w-[140px]"
              >
                Approve Return
              </MainButton>
            </div>
          ) : isStandardOrderAndCreated ? (
            <div className="flex space-x-2">
              <MainButton
                onClick={() => navigate(`/staff/order/${order.id}`)}
                className="border-layout !bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
              >
                Details
              </MainButton>
              <MainButton
                onClick={() => {
                  handleChangeOrderStatus({
                    ...(order as Order),
                    order_id: order.id,
                    status: OrderStatus.PICKED_UP,
                  });
                }}
                loading={isPending}
                className="h-9 min-w-[140px]"
              >
                Approve Pickup
              </MainButton>
            </div>
          ) : (
            <MainButton
              onClick={() => {
                const detailsPath =
                  orderType === "return_order"
                    ? `/staff/return-orders/${order.id}`
                    : `/staff/order/${order.id}`;
                navigate(detailsPath);
              }}
              className="border-layout !bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
            >
              Details
            </MainButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeOrderCard;
