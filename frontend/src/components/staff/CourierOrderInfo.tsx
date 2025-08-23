import type { Order, ReturnOrder } from "../../types/Orders";

interface CourierOrderInfoProps {
  order: Order | ReturnOrder;
}

const CourierOrderInfo = ({ order }: CourierOrderInfoProps) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-primary mb-2 text-lg font-semibold">
          Customer Information
        </h3>
        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {order.user.first_name}{" "}
            {order.user.last_name}
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
  );
};

export default CourierOrderInfo;
