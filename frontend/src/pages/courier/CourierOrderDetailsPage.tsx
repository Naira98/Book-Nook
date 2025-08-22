import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import OrderItemsTableWithQuantity from "../../components/shared/orderCards/OrderItemsTableWithQuantity";
import CourierOrderInfo from "../../components/staff/CourierOrderInfo";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useChangeOrderStatus } from "../../hooks/orders/useChangeOrderStatus";
import { useGetOrder } from "../../hooks/orders/useGetOrder";
import { OrderStatus, type changeOrderStatusRequest } from "../../types/Orders";

const CourierOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isPending, error } = useGetOrder(orderId);
  const { me } = useGetMe();
  const { changeOrderStatus, isPending: isUpdatingStatus } =
    useChangeOrderStatus();

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

  if (!order) {
    return <div className="py-8 text-center">Order not found</div>;
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!me) return;
    const payload: changeOrderStatusRequest = {
      ...order,
      order_id: order.id,
      status: newStatus,
    };
    console.log("payload", payload);

    changeOrderStatus(payload);
  };

  const getNextAction = () => {
    switch (order.status) {
      case OrderStatus.CREATED:
        handleStatusChange(OrderStatus.ON_THE_WAY);
        break;
      case OrderStatus.ON_THE_WAY:
        handleStatusChange(OrderStatus.PICKED_UP);
        break;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MainButton onClick={() => navigate(-1)} className="mb-4 !w-auto px-4">
        <ArrowLeft className="mr-2" size={16}/>
        Back
      </MainButton>

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-primary mb-4 text-xl font-bold">
          Order Details #{order.id}
        </h2>
        <CourierOrderInfo order={order} />
      </div>

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <OrderItemsTableWithQuantity order={order} />
      </div>

      <div className="flex justify-end space-x-4">
        {order.status !== "PROBLEM" && order.status !== "PICKED_UP" && (
          <MainButton
            onClick={() => {
              handleStatusChange(OrderStatus.PROBLEM);
            }}
            loading={isUpdatingStatus}
            className="!bg-error !w-[150px] hover:!bg-red-600"
          >
            Report Problem
          </MainButton>
        )}
        {order.status !== "PICKED_UP" && (
          <MainButton
            onClick={getNextAction}
            loading={isUpdatingStatus}
            className="!w-[160px]"
          >
            {order.status === "CREATED"
              ? "Start Pickup"
              : order.status === "ON_THE_WAY"
                ? "Confirm Drop-off"
                : "Order Completed"}
          </MainButton>
        )}
      </div>
    </div>
  );
};

export default CourierOrderDetailsPage;
