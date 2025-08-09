import { useNavigate } from "react-router-dom";
import type {
  OrderStatus,
  ReturnOrderStatus,
  ReturnOrder,
} from "../../../types/Orders";
import { MapPin, CalendarArrowUp, User, BookOpen } from "lucide-react";
import MainButton from "../../shared/buttons/MainButton";

type ReturnOrderCard = {
  getStatusIcon: (status: OrderStatus | ReturnOrderStatus) => string;
  returnOrder: ReturnOrder;
  getStatusColor: (status: OrderStatus | ReturnOrderStatus) => string;
};
export default function ReturnOrderCard({
  returnOrder,
  getStatusIcon,
  getStatusColor,
}: ReturnOrderCard) {
  const navigate = useNavigate();

  return (
    <div
      key={returnOrder.id}
      className={`rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarArrowUp size={20} className="stroke-secondary" />
            <h3 className="font-medium text-gray-800">
              Delivery Order{" "}
              <span className="text-sm text-gray-500">#{returnOrder.id}</span>
            </h3>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-sm">{getStatusIcon(returnOrder.status)}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(returnOrder.status)}`}
          >
            {returnOrder.status.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      <div className="mb-3 space-y-1.5">
        <div className="flex items-start">
          <MapPin size={16} className="stroke-secondary mr-2" />
          <p className="text-xs font-medium text-gray-500">
            To:{" "}
            <span className="text-sm font-semibold text-gray-700">
              {returnOrder.address}
            </span>
          </p>
        </div>
        {returnOrder.user.first_name && (
          <div className="flex items-start">
            <User size={18} className="stroke-secondary mr-2" />
            <div>
              <p className="text-xs font-medium text-gray-500">
                Owner:{" "}
                <span className="text-sm font-semibold text-gray-700">
                  {returnOrder.user.first_name} {returnOrder.user.last_name}
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
              {returnOrder.number_of_books}
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-2">
        <span className="text-xs text-gray-500">
          {new Date(returnOrder.created_at).toLocaleString()}
        </span>
        <div className="flex space-x-2">
          {returnOrder.status === "CREATED" ? (
            <MainButton className="h-[30px] !w-20" label="Accept" />
          ) : (
            <MainButton
              onClick={() => {
                navigate(`/order/${returnOrder.id}`);
              }}
              className="h-[30px] !w-20 !bg-gray-200 !text-gray-700 hover:!bg-gray-50"
              label="Details"
            />
          )}
        </div>
      </div>
    </div>
  );
}
