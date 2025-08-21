import { useNavigate, useParams } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import OrderInfo from "../../components/staff/OrderInfo";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useChangeReturnOrderStatus } from "../../hooks/orders/useChangeReturnOrderStatus";
import { useGetReturnOrder } from "../../hooks/orders/useGetReturnOrder";
import {
  ReturnOrderStatus,
  type changeRetrunOrderStatusRequest,
} from "../../types/Orders";

const EmployeeReturnOrderDetailsPage = () => {
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

    changeReturnOrderStatus(payload);
  };

  const getNextAction = () => {
    switch (returnOrder.status) {
      case ReturnOrderStatus.CREATED:
      case ReturnOrderStatus.PICKED_UP:
        handleStatusChange(ReturnOrderStatus.CHECKING);
        break;
      case ReturnOrderStatus.CHECKING:
        handleStatusChange(ReturnOrderStatus.DONE);
        break;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <MainButton
        onClick={() => navigate("/staff/orders")}
        className="mb-4 !w-auto px-4"
      >
        Back to Orders
      </MainButton>

      <OrderInfo order={returnOrder} isOrder={false} />

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: "var(--color-primary)" }}
        >
          Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                  style={{ color: "var(--color-primary)" }}
                >
                  Item
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
                  style={{ color: "var(--color-primary)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returnOrder.borrow_order_books_details.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="border-layout bg-accent text-layout disabled:hover:bg-primary relative flex h-9 w-30 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70">
                      Not Returned
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {returnOrder.status !== "PROBLEM" && returnOrder.status !== "DONE" && (
        <div className="flex justify-end">
          <MainButton
            onClick={getNextAction}
            loading={isUpdatingStatus}
            className="!w-[160px]"
          >
            {returnOrder.status === "CREATED" ||
            returnOrder.status === "PICKED_UP"
              ? "Approve Pickup"
              : returnOrder.status === "CHECKING"
                ? "Done"
                : "Order Completed"}
          </MainButton>
        </div>
      )}
    </div>
  );
};

export default EmployeeReturnOrderDetailsPage;
