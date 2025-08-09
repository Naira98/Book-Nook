import { useParams, useNavigate } from "react-router-dom";
import { useGetOrder } from "../../hooks/orders/useGetOrder";
import { useChangeOrderStatus } from "../../hooks/orders/useChangeOrderStatus";
import { OrderStatus, type changeOrderStatusRequest } from "../../types/Orders";
import MainButton from "../../components/shared/buttons/MainButton";
import { useGetMe } from "../../hooks/auth/useGetMe";

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, isPending, error } = useGetOrder(id);
  const { me } = useGetMe();
  const order_type = "order";
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
      courier_id: me.id,
      order_id: order.id,
      status: newStatus,
    };
    console.log("payload", payload);

    changeOrderStatus(payload, {
      onSuccess: () => {
        navigate("/orders");
      },
    });
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
      <MainButton
        onClick={() => navigate("/courier/orders")}
        className="mb-4 !w-auto px-4"
        label="Back to Orders"
      ></MainButton>

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-primary mb-4 text-xl font-bold">
          Order #{order.id} Details
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-primary mb-2 text-lg font-semibold">
              Customer Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {order.user.first_name} {order.user.last_name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {order.user.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {order.phone_number}
              </p>
              <p>
                <span className="font-medium">Address:</span> {order.address}
              </p>
            </div>
          </div>

          <div>
            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: "var(--color-primary)" }}
            >
              Order Information
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Order Date:</span>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Type:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs text-green-800`}
                  style={{
                    backgroundColor:
                      order_type === "order"
                        ? "var(--color-secondary)"
                        : "#E9D8FD",
                  }}
                >
                  Order
                </span>
              </p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs ${
                    order.status === "CREATED"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "ON_THE_WAY"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "PICKED_UP"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-600 text-white"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p>
                <span className="font-medium">Number of books:</span>{" "}
                {order.number_of_books}
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
              {order.borrow_order_books_details.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">1</td>
                </tr>
              ))}
              {order.purchase_order_books_details.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {order.status !== "PROBLEM" && (
        <div className="flex justify-end space-x-4">
          <MainButton
            onClick={() => {
              handleStatusChange(OrderStatus.PROBLEM);
            }}
            loading={isUpdatingStatus}
            className="!w-[150px] bg-red-600 hover:bg-red-700"
            label="Report Problem"
          />
          {order.status !== "PICKED_UP" && (
            <MainButton
              onClick={getNextAction}
              loading={isUpdatingStatus}
              className="!w-[160px]"
              label={
                order.status === "CREATED"
                  ? "On The Way"
                  : order.status === "ON_THE_WAY"
                    ? "Picked Up"
                    : "Order Completed"
              }
            />
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
