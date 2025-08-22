import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import OrderItemsTableWithQuantity from "../../components/shared/orderCards/OrderItemsTableWithQuantity";
import CourierOrderInfo from "../../components/staff/CourierOrderInfo";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useChangeReturnOrderStatus } from "../../hooks/orders/useChangeReturnOrderStatus";
import { useGetReturnOrder } from "../../hooks/orders/useGetReturnOrder";
import {
  ReturnOrderStatus,
  type changeRetrunOrderStatusRequest,
} from "../../types/Orders";

const CourierReturnOrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { returnOrder, isPending, error } = useGetReturnOrder(orderId);
  const { me } = useGetMe();
  const { changeReturnOrderStatus, isPending: isUpdatingStatus } =
    useChangeReturnOrderStatus();

  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Error fetching order: {error.message}
      </div>
    );
  }

  if (!returnOrder) {
    return <div className="py-8 text-center">Order not found</div>;
  }

  const handleStatusChange = (newStatus: ReturnOrderStatus) => {
    if (!me) return;
    const payload: changeRetrunOrderStatusRequest = {
      ...returnOrder,
      courier_id: me.id,
      return_order_id: returnOrder.id,
      status: newStatus,
    };
    console.log("payload", payload);

    changeReturnOrderStatus(payload);
  };

  const getNextAction = () => {
    switch (returnOrder.status) {
      case ReturnOrderStatus.CREATED:
        handleStatusChange(ReturnOrderStatus.ON_THE_WAY);
        break;
      case ReturnOrderStatus.ON_THE_WAY:
        handleStatusChange(ReturnOrderStatus.PICKED_UP);
        break;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MainButton onClick={() => navigate(-1)} className="mb-4 !w-auto px-4">
        <ArrowLeft className="mr-2" size={16} />
        Back
      </MainButton>

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-primary mb-4 text-xl font-bold">
          Return Order Details #{returnOrder.id}
        </h2>

        <CourierOrderInfo order={returnOrder} />
      </div>

      <OrderItemsTableWithQuantity order={returnOrder} />

      {(returnOrder.status === ReturnOrderStatus.CREATED ||
        returnOrder.status === ReturnOrderStatus.ON_THE_WAY) && (
        <div className="flex justify-end space-x-4">
          <MainButton
            onClick={() => {
              handleStatusChange(ReturnOrderStatus.PROBLEM);
            }}
            loading={isUpdatingStatus}
            className="!w-[150px] bg-red-600 hover:bg-red-700"
          >
            Report Problem
          </MainButton>

          <MainButton
            onClick={getNextAction}
            loading={isUpdatingStatus}
            className="!w-[190px]"
          >
            {returnOrder.status === ReturnOrderStatus.CREATED
              ? "Start Return Pickup"
              : "Confirm Return Pickup"}
          </MainButton>
        </div>
      )}
    </div>
  );
};

export default CourierReturnOrderDetailsPage;
