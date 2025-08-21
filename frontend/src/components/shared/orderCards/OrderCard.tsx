import { BookOpen, Box, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChangeOrderStatus } from "../../../hooks/orders/useChangeOrderStatus";
import {
  OrderStatus,
  PickUpType,
  ReturnOrderStatus,
  type Order,
  type changeOrderStatusRequest,
} from "../../../types/Orders";
import MainButton from "../buttons/MainButton";

type OrderCard = {
  getStatusIcon: (status: OrderStatus | ReturnOrderStatus) => string;
  order: Order;
  getStatusColor: (status: OrderStatus | ReturnOrderStatus) => string;
  pickUpType: PickUpType;
};

export default function OrderCard({
  order,
  getStatusIcon,
  getStatusColor,
  pickUpType,
}: OrderCard) {
  const navigate = useNavigate();
  const { changeOrderStatus, isPending } = useChangeOrderStatus();

  const handleChangeStatus = (values: changeOrderStatusRequest) => {
    changeOrderStatus(values);
  };

  return (
    <div
      className={`rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Box size={20} className="stroke-secondary" />
            <h3 className="font-medium text-gray-800">
              Delivery Order{" "}
              <span className="text-sm text-gray-500">#{order.id}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm">{getStatusIcon(order.status)}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
          >
            {order.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-1.5">
        <div className="flex items-start">
          <MapPin size={16} className="stroke-secondary mr-2" />
          <p className="text-xs font-medium text-gray-500">
            To:{" "}
            <span className="text-sm font-semibold text-gray-700">
              {order.address}
            </span>
          </p>
        </div>
        {order.user.first_name && (
          <div className="flex items-start">
            <User size={18} className="stroke-secondary mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-500">
                Owner:{" "}
                <span className="text-sm font-semibold text-gray-700">
                  {order.user.first_name} {order.user.last_name}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <BookOpen size={16} className="stroke-secondary mr-2" />
          <p className="text-xs font-medium text-gray-500">
            Num Of Books:{" "}
            <span className="text-sm font-semibold text-gray-700">
              {order.number_of_books}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <span className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </span>
        <div className="flex space-x-2">
          {order.status === "CREATED" ? (
            <MainButton
              onClick={() => {
                handleChangeStatus({
                  ...order,
                  order_id: order.id,
                  status:
                    pickUpType == PickUpType.COURIER
                      ? OrderStatus.ON_THE_WAY
                      : OrderStatus.PICKED_UP,
                });
              }}
              loading={isPending}
              className="h-[30px] !w-20"
            >
              Accept
            </MainButton>
          ) : (
            <MainButton
              onClick={() => {
                navigate(
                  pickUpType == PickUpType.COURIER
                    ? `/order/${order.id}`
                    : `/employee/orders/${order.id}`,
                );
              }}
              className="h-[30px] !w-20 !bg-gray-200 !text-gray-700 hover:!bg-gray-50"
            >
              Details
            </MainButton>
          )}
        </div>
      </div>
    </div>
  );
}
