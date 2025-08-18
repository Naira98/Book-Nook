import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import type { IClientBorrows } from "../../types/ReturnOrder";
import { formatDate, formatMoney } from "../../utils/formatting";
import { useMarkBookAsLost } from "../../hooks/orders/useMarkBookAsLost";

interface BorrowedBookItemProps {
  borrowedBook: IClientBorrows;
  isSelected: boolean;
  onSelect: (bookId: number, selected: boolean) => void;
  showActions?: boolean;
}

const BorrowedBookItem = ({
  borrowedBook,
  isSelected,
  onSelect,
  showActions = true,
}: BorrowedBookItemProps) => {
  const { markBookAsLost, isPending } = useMarkBookAsLost();

  const now = new Date();
  const expectedReturnDate = new Date(borrowedBook.expected_return_date);
  const isOverdue = now > expectedReturnDate;
  const daysOverdue = isOverdue
    ? Math.ceil(
        (now.getTime() - expectedReturnDate.getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  const delayFees = isOverdue
    ? parseFloat(borrowedBook.delay_fees_per_day) * daysOverdue
    : 0;

  // Calculate the net refund amount
  const depositAmount = parseFloat(borrowedBook.deposit_fees);
  const netRefund = depositAmount - delayFees;

  const handleMarkAsLost = async () => {
    markBookAsLost({
      borrow_order_book_id: borrowedBook.book_details_id,
      new_status: "LOST",
    });
  };

  return (
    <div
      className={`relative rounded-lg border-2 transition-all ${
        isSelected
          ? "border-primary/5 bg-primary/5"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      {/* Selection Checkbox */}
      {showActions && (
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) =>
              onSelect(borrowedBook.book_details_id, e.target.checked)
            }
            className="text-primary focus:ring-primary h-5 w-5 rounded border-gray-300"
          />
        </div>
      )}

      <div className="flex p-4">
        {/* Book Cover */}
        <div className="mr-4 w-24 flex-shrink-0">
          <img
            src={borrowedBook.book.cover_img}
            alt={borrowedBook.book.title}
            className="h-32 w-full rounded-lg object-cover shadow-md"
          />
        </div>

        {/* Book Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {borrowedBook.book.title}
              </h3>
              <p className="text-sm text-gray-600">
                Book ID: {borrowedBook.book_details_id}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              {isOverdue && (
                <div className="flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1">
                  <AlertTriangle className="text-error h-4 w-4" />
                  <span className="text-error text-sm font-medium">
                    {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                  </span>
                </div>
              )}
              {!isOverdue && (
                <div className="flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1">
                  <CheckCircle className="text-success h-4 w-4" />
                  <span className="text-success text-sm font-medium">
                    On time
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Return Date */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Expected return: {formatDate(expectedReturnDate)}</span>
          </div>

          {/* Pricing Details */}
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="text-md mb-2 font-semibold text-gray-800">
              Pricing Breakdown
            </h4>
            <div className="space-y-2">
              {/* Initial Costs */}
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-sm text-gray-600">Initial Deposit:</span>
                <span className="font-medium text-gray-900">
                  {formatMoney(borrowedBook.deposit_fees)} EGP
                </span>
              </div>

              {/* Delay Fees Section - only show if overdue */}
              {isOverdue && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Delay Fees (per day):
                    </span>
                    <span className="text-secondary font-medium">
                      {formatMoney(borrowedBook.delay_fees_per_day)} EGP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-error text-sm">
                      Total Delay Fees:
                    </span>
                    <span className="text-error font-semibold">
                      - {formatMoney(delayFees.toString())} EGP
                    </span>
                  </div>
                </div>
              )}

              {/* Net Refund/Payment */}
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-700">
                    Amount to be Refunded:
                  </span>
                  <span
                    className={`text-xl font-extrabold ${
                      netRefund >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {formatMoney(Math.abs(netRefund).toString())} EGP
                  </span>
                </div>
                {netRefund < 0 && (
                  <p className="text-error mt-1 text-right text-sm italic">
                    You will need to pay this amount to complete the return.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex space-x-2">
              <button
                onClick={handleMarkAsLost}
                disabled={isPending}
                className="text-error flex cursor-pointer items-center space-x-2 rounded-md bg-red-100 px-3 py-2 text-sm font-medium disabled:opacity-50"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>{isPending ? "Marking..." : "Mark as Lost"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowedBookItem;
