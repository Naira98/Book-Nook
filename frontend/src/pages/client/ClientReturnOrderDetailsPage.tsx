import { CheckCircle, Circle, PackageCheck, Search, Truck } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetUserReturnOrderDetails } from "../../hooks/orders/useGetUserReturnOrderDetails";
import type { BorrowBookProblem } from "../../types/Orders";

const statusSteps = {
  SITE: ["CREATED", "CHICKING", "DONE"],
  COURIER: ["CREATED", "ON_THE_WAY", "PICKED_UP", "CHICKING", "DONE"],
};

export default function ClientReturnOrderDetailsPage() {
  const { returnOrderId } = useParams<{ returnOrderId: string }>();
  console.log(returnOrderId);

  const { returnOrder } = useGetUserReturnOrderDetails(returnOrderId);

  if (!returnOrder)
    return <div className="text-red-500">No returnOrder found</div>;

  const steps =
    statusSteps[returnOrder.pickup_type as "SITE" | "COURIER"] || [];
  const currentIndex = steps.indexOf(returnOrder.status);

  // Totals breakdown
  const borrowTotal = returnOrder.borrow_order_books_details.reduce(
    (sum, b) => sum + parseFloat(b.borrow_fees) + parseFloat(b.deposit_fees),
    0,
  );

  const discount = returnOrder.borrow_order_books_details.reduce(
    (sum, b) => sum + parseFloat(b.promo_code_discount || "0"),
    0,
  );

  const deliveryFees = parseFloat(returnOrder.delivery_fees || "0");

  const statusFormat = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="text-secondary text-sm">created</span>;
      case "ON_THE_WAY":
        return <span className="text-sm">On the Way</span>;
      case "PICKED_UP":
        return <span className="text-success text-sm">Picked Up</span>;
      case "PROBLEM":
        return <span className="text-error text-sm">Problem</span>;
      case "CHICKING":
        return <span className="text-primary text-sm">Chicking</span>;
      case "DONE":
        return <span className="text-success text-sm">Done</span>;
      default:
        return status;
    }
  };

  const borrowBookProblemFormat = (status: BorrowBookProblem) => {
    switch (status) {
      case "NORMAL":
        return <span className="text-success text-sm">Normal</span>;
      case "LOST":
        return <span className="text-error text-sm">Lost</span>;

      case "DAMAGED":
        return <span className="text-error text-sm">Damaged</span>;
      default:
        return status;
    }
  };
  return (
    <div className="min-h-screen w-full p-6">
      {/* Header */}
      <h1 className="text-primary mb-6 flex items-center justify-between text-2xl font-bold">
        returnOrder #{returnOrder.id}
        {statusFormat(returnOrder.status)}
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
                    idx < currentIndex
                      ? "bg-[var(--color-secondary)]"
                      : "bg-gray-300"
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
                    ? "bg-[var(--color-secondary)] text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step === "CREATED" && <Circle />}
                {step === "ON_THE_WAY" && <Truck />}
                {step === "PICKED_UP" && <PackageCheck />}
                {step === "CHICKING" && <Search />}
                {step === "DONE" && <CheckCircle />}
              </div>
              <p
                className={`text-sm font-medium ${
                  isActive ? "text-[var(--color-primary)]" : "text-gray-500"
                }`}
              >
                {step.replace("_", " ")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Details */}
      <div className="space-y-8 rounded-xl bg-white">
        <div className="border-b border-slate-300 pb-8">
          <h2 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
            Return Order Info
          </h2>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {returnOrder.address}
          </p>
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {returnOrder.phone_number}
          </p>
          <p>
            <span className="font-semibold">Pickup Type:</span>{" "}
            {returnOrder.pickup_type}
          </p>
        </div>

        {returnOrder.borrow_order_books_details.length > 0 && (
          <div className="border-b border-slate-300 pb-8">
            <h2 className="mb-4 text-xl font-semibold text-[var(--color-primary)]">
              Borrow Books
            </h2>
            <div className="space-y-4">
              {returnOrder.borrow_order_books_details.map((item) => (
                <div
                  key={item.id}
                  className="flex w-full items-center space-x-4"
                >
                  <img
                    src={item.book_details.book.cover_img}
                    alt={item.book_details.book.title}
                    className="h-20 w-16 rounded object-cover"
                  />
                  <div className="w-full">
                    <p className="flex items-center justify-between font-semibold">
                      <span>{item.book_details.book.title}</span>
                      <span className="text-sm">
                        {borrowBookProblemFormat(item.borrow_book_problem)}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      Borrow Fee: ${item.borrow_fees}
                    </p>
                    <p className="text-sm text-gray-600">
                      Deposit: ${item.deposit_fees}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white text-lg font-bold">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-primary)]">
            Payment Summary
          </h2>
          <div className="space-y-4 text-gray-700">
            {borrowTotal > 0 && (
              <div className="flex w-full items-center justify-between gap-2 capitalize">
                <span>Total Borrow:</span>
                <span>{borrowTotal.toFixed(2)} EGP</span>
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
              <span>{returnOrder.total_price} EGP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
