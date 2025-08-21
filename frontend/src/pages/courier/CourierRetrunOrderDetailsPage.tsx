import { useParams, useNavigate } from "react-router-dom";
import {
  ReturnOrderStatus,
  type changeRetrunOrderStatusRequest,
} from "../../types/Orders";
import MainButton from "../../components/shared/buttons/MainButton";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useGetReturnOrder } from "../../hooks/orders/useGetReturnOrder";
import { useChangeReturnOrderStatus } from "../../hooks/orders/useChangeReturnOrderStatus";

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
      <MainButton
        onClick={() => navigate("/courier/orders")}
        className="mb-4 !w-auto px-4"
      >
        Back to Orders
      </MainButton>

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-primary mb-4 text-xl font-bold">
          Return Order #{returnOrder.id} Details
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-primary mb-2 text-lg font-semibold">
              Customer Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {returnOrder.user.first_name} {returnOrder.user.last_name}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {returnOrder.user.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span>{" "}
                {returnOrder.phone_number}
              </p>
              <p>
                <span className="font-medium">Address:</span>{" "}
                {returnOrder.address}
              </p>
            </div>
          </div>

          <div>
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Return Order Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Return Order Date:</span>{" "}
                {new Date(returnOrder.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Type:</span>
                <span
                  className={`ml-2 rounded-full bg-[#E9D8FD] px-2 py-1 text-xs text-green-800`}
                >
                  Retrun Order
                </span>
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                    returnOrder.status === "CREATED"
                      ? "bg-blue-100 text-blue-800"
                      : returnOrder.status === "ON_THE_WAY"
                        ? "bg-yellow-100 text-yellow-800"
                        : returnOrder.status === "PICKED_UP"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-600 text-white"
                  }`}
                >
                  {returnOrder.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Number of books:</span>{" "}
                {returnOrder.number_of_books}
              </p>
            </div>
          </div>
        </div>
      </div>

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
                  Quantity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returnOrder.borrow_order_books_details.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {returnOrder.status !== "PROBLEM" && (
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
          {returnOrder.status !== "PICKED_UP" && (
            <MainButton
              onClick={getNextAction}
              loading={isUpdatingStatus}
              className="!w-[160px]"
            >
              {returnOrder.status === "CREATED"
                ? "On The Way"
                : returnOrder.status === "ON_THE_WAY"
                  ? "Picked Up"
                  : "Order Completed"}
            </MainButton>
          )}
        </div>
      )}
    </div>
  );
};

export default CourierReturnOrderDetailsPage;
