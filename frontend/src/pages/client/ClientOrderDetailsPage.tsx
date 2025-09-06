import { CheckCircle, Circle, Truck } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetUserOrderDetails } from "../../hooks/orders/useGetUserOrderDetails";
import { formatMoney } from "../../utils/formatting";

const statusSteps = {
  SITE: ["CREATED", "PICKED_UP"],
  COURIER: ["CREATED", "ON_THE_WAY", "PICKED_UP"],
};

export default function ClientOrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order } = useGetUserOrderDetails(orderId);

  if (!order) return <div className="text-red-500">No order found</div>;

  const steps = statusSteps[order.pickup_type as "SITE" | "COURIER"] || [];
  const currentIndex = steps.indexOf(order.status);

  // Totals breakdown
  const borrowTotal = order.borrow_order_books_details.reduce(
    (sum, b) => sum + parseFloat(b.borrow_fees) + parseFloat(b.deposit_fees),
    0,
  );

  const purchaseTotal = order.purchase_order_books_details.reduce(
    (sum, p) => sum + parseFloat(p.paid_price_per_book) * p.quantity,
    0,
  );

  const discount =
    order.borrow_order_books_details.reduce(
      (sum, b) => sum + parseFloat(b.promo_code_discount || "0"),
      0,
    ) +
    order.purchase_order_books_details.reduce(
      (sum, p) =>
        sum + parseFloat(p.promo_code_discount_per_book || "0") * p.quantity,
      0,
    );

  const deliveryFees = parseFloat(order.delivery_fees || "0");
  const statusFormat = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="text-secondary text-sm">CREATED</span>;
      case "ON_THE_WAY":
        return <span className="text-sm">ON THE WAY</span>;
      case "PICKED_UP":
        return <span className="text-success text-sm">PICKED UP</span>;
      case "PROBLEM":
        return <span className="text-error text-sm">PROBLEM</span>;
      default:
        return status;
    }
  };
  return (
    <div className="min-h-screen w-full p-6">
      {/* Header */}
      <h1 className="text-primary mb-6 flex items-center justify-between text-2xl font-bold">
        Order #{order.id}
        {statusFormat(order.status)}
      </h1>

      {/* Timeline */}
      <div className="relative mb-10 flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={step} className="flex flex-1 flex-col items-center">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute top-4 h-1 ${
                    idx < currentIndex ? "bg-secondary" : "bg-gray-300"
                  }`}
                  style={{
                    left: `${(idx / (steps.length - 1)) * 100}%`,
                    width: `${100 / (steps.length - 1)}%`,
                  }}
                ></div>
              )}

              {/* Step Icon */}
              <div
                className={`z-10 mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                  isCompleted || isActive
                    ? "bg-secondary text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step === "CREATED" && <Circle />}
                {step === "ON_THE_WAY" && <Truck />}
                {step === "PICKED_UP" && <CheckCircle />}
              </div>
              <p
                className={`text-sm font-medium ${
                  isActive ? "text-primary" : "text-gray-500"
                }`}
              >
                {step.replaceAll("_", " ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Details */}
      <div className="space-y-8 rounded-xl bg-white">
        <div className="border-b border-slate-300 pb-8">
          <h2 className="text-primary mb-2 text-xl font-semibold">
            Order Info
          </h2>
          {order.pickup_type === "COURIER" ? (
            <>
              <p>
                <span className="font-semibold">Address:</span> {order.address}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {order.phone_number}
              </p>
              <p>
                <span className="font-semibold">Pickup Type:</span>{" "}
                {order.pickup_type}
              </p>
            </>
          ) : (
            <p>
              <span className="font-semibold">Pickup Type:</span>{" "}
              {order.pickup_type}
            </p>
          )}
        </div>

        {order.purchase_order_books_details.length > 0 && (
          <div className="border-b border-slate-300 pb-8">
            <h2 className="text-primary mb-4 text-xl font-semibold">
              Purchase Books
            </h2>
            <div className="space-y-4">
              {order.purchase_order_books_details.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.book_details.book.cover_img}
                    alt={item.book_details.book.title}
                    className="h-20 w-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold">
                      {item.book_details.book.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: {formatMoney(item.paid_price_per_book)} EGP
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.borrow_order_books_details.length > 0 && (
          <div className="border-b border-slate-300 pb-8">
            <h2 className="text-primary mb-4 text-xl font-semibold">
              Borrow Books
            </h2>
            <div className="space-y-4">
              {order.borrow_order_books_details.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.book_details.book.cover_img}
                    alt={item.book_details.book.title}
                    className="h-20 w-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-semibold">
                      {item.book_details.book.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Borrow Fee: {formatMoney(item.borrow_fees)} EGP
                    </p>
                    <p className="text-sm text-gray-600">
                      Deposit: {formatMoney(item.deposit_fees)} EGP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white text-lg font-bold">
          <h2 className="text-primary mb-4 text-xl font-semibold">
            Payment Summary
          </h2>
          <div className="space-y-4 text-gray-700">
            {borrowTotal > 0 && (
              <div className="flex w-full items-center justify-between gap-2 capitalize">
                <span>Total Borrow:</span>
                <span>{borrowTotal.toFixed(2)} EGP</span>
              </div>
            )}

            {purchaseTotal > 0 && (
              <div className="flex w-full items-center justify-between gap-2 capitalize">
                <span>Total Purchase:</span>
                <span>{purchaseTotal.toFixed(2)} EGP</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex w-full items-center justify-between gap-2 capitalize">
                <span>Promo Discount:</span>
                <span>{discount.toFixed(2)} EGP</span>
              </div>
            )}

            {deliveryFees > 0 && (
              <div className="flex w-full items-center justify-between gap-2 capitalize">
                <span>Delivery Fees:</span>
                <span>{deliveryFees.toFixed(2)} EGP</span>
              </div>
            )}

            <hr />
            <div className="flex w-full items-center justify-between gap-2 capitalize">
              <span>Final Total:</span>
              <span>{formatMoney(order.total_price)} EGP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
