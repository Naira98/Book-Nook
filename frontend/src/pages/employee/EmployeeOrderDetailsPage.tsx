import { useNavigate, useParams } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import OrderInfo from "../../components/staff/OrderInfo";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useChangeOrderStatus } from "../../hooks/orders/useChangeOrderStatus";
import { useGetOrder } from "../../hooks/orders/useGetOrder";
import { OrderStatus, type changeOrderStatusRequest } from "../../types/Orders";

const EmployeeOrderDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { order, isPending, error } = useGetOrder(orderId);
  const { me } = useGetMe();
  const { changeOrderStatus, isPending: isUpdatingStatus } =
    useChangeOrderStatus();

  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-error py-8 text-center">
        Error fetching order: {error.message}
      </div>
    );
  }

  if (!order) {
    return <div className="text-layout py-8 text-center">Order not found</div>;
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!me) return;
    const payload: changeOrderStatusRequest = {
      ...order,
      order_id: order.id,
      status: newStatus,
    };
    changeOrderStatus(payload);
  };

  const getNextAction = () => {
    if (order.status === OrderStatus.CREATED)
      handleStatusChange(OrderStatus.PICKED_UP);
  };

  const getActionButtonLabel = () => {
    if (order.status === OrderStatus.CREATED) {
      return "Approve Pickup";
    }
    return "Order Completed";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MainButton
        onClick={() => navigate("/staff/orders")}
        className="mb-4 !w-auto px-4"
      >
        Back to Orders
      </MainButton>

      <OrderInfo order={order} isOrder={true} />

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h3 className="text-primary mb-4 text-xl font-semibold">Order Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-accent text-primary px-6 py-3 text-center text-xs font-medium tracking-wider uppercase">
                  Item
                </th>
                <th className="bg-accent text-primary px-6 py-3 text-center text-xs font-medium tracking-wider uppercase">
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.borrow_order_books_details.map((item, index) => (
                <tr key={`borrow-${index}`}>
                  <td className="text-layout px-6 py-4 text-center whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="text-layout px-6 py-4 text-center whitespace-nowrap">
                    1
                  </td>
                </tr>
              ))}
              {order.purchase_order_books_details.map((item, index) => (
                <tr key={`purchase-${index}`}>
                  <td className="text-layout px-6 py-4 text-center whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="text-layout px-6 py-4 text-center whitespace-nowrap">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Action Button Section */}
      {order.status !== OrderStatus.PICKED_UP &&
        order.status !== OrderStatus.PROBLEM && (
          <div className="flex justify-end">
            <MainButton
              onClick={getNextAction}
              loading={isUpdatingStatus}
              className="!w-[160px]"
            >
              {getActionButtonLabel()}
            </MainButton>
          </div>
        )}
    </div>
  );
};

export default EmployeeOrderDetailsPage;
