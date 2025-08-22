import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import MainButton from "../../components/shared/buttons/MainButton";
import EmployeeOrderInfo from "../../components/staff/EmployeeOrderInfo";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useChangeReturnOrderStatus } from "../../hooks/orders/useChangeReturnOrderStatus";
import { useGetReturnOrder } from "../../hooks/orders/useGetReturnOrder";
import { useUpdateBorrowOrderBookProblem } from "../../hooks/orders/useUpdateBorrowOrderBookProblem";
import {
  BorrowBookProblem,
  ReturnOrderStatus,
  type changeRetrunOrderStatusRequest,
} from "../../types/Orders";

const EmployeeReturnOrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { returnOrder, isPending, error } = useGetReturnOrder(orderId);
  const queryClient = useQueryClient();
  const { me } = useGetMe();
  const { changeReturnOrderStatus, isPending: isUpdatingStatus } =
    useChangeReturnOrderStatus();
  const { updateBorrowBookProblem, isPending: isUpdatingBookProblem } =
    useUpdateBorrowOrderBookProblem();

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

  if (!returnOrder) {
    return <div className="text-layout py-8 text-center">Order not found</div>;
  }

  const handleStatusChange = (newStatus: ReturnOrderStatus) => {
    if (!me) return;
    const payload: changeRetrunOrderStatusRequest = {
      ...returnOrder,
      courier_id: returnOrder.courier_id || me.id,
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

  const handleBookProblem = (
    borrow_order_book_id: number,
    problemType: BorrowBookProblem,
  ) => {
    updateBorrowBookProblem(
      {
        borrow_order_book_id,
        new_status: problemType,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["returnOrder", orderId] });
        },
      },
    );
  };

  const isChecking = returnOrder.status === ReturnOrderStatus.CHECKING;
  const isAnyActionPending = isUpdatingStatus || isUpdatingBookProblem;

  return (
    <div>
      <MainButton onClick={() => navigate(-1)} className="mb-4 !w-auto px-4">
        <ArrowLeft className="mr-2" size={16} />
        Back
      </MainButton>

      <EmployeeOrderInfo order={returnOrder} isOrder={false} />

      <div className="mb-6 overflow-hidden rounded-lg bg-white p-6 shadow-md">
        <h3 className="text-primary mb-4 text-xl font-semibold">
          Return Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="bg-accent text-primary px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Item
                </th>
                <th className="bg-accent text-primary px-6 py-3 text-center text-xs font-medium tracking-wider uppercase">
                  Status
                </th>
                <th className="bg-accent text-primary px-6 py-3 text-center text-xs font-medium tracking-wider uppercase">
                  {isChecking ? "Actions" : "Quantity"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {returnOrder.borrow_order_books_details.map((item, index) => (
                <tr key={index}>
                  <td className="text-layout px-6 py-4 whitespace-nowrap">
                    {item.book_details.book.title}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className="text-layout">
                      {item.borrow_book_problem}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {isChecking ? (
                      <div className="flex justify-center space-x-2">
                        <MainButton
                          onClick={() =>
                            handleBookProblem(item.id, BorrowBookProblem.NORMAL)
                          }
                          disabled={isUpdatingBookProblem}
                          className="!bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
                        >
                          Normal
                        </MainButton>
                        <MainButton
                          onClick={() =>
                            handleBookProblem(item.id, BorrowBookProblem.LOST)
                          }
                          disabled={isUpdatingBookProblem}
                          className="!bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
                        >
                          Lost
                        </MainButton>
                        <MainButton
                          onClick={() =>
                            handleBookProblem(
                              item.id,
                              BorrowBookProblem.DAMAGED,
                            )
                          }
                          disabled={isUpdatingBookProblem}
                          className="!bg-accent !text-layout h-9 w-24 border hover:!bg-gray-200"
                        >
                          Damaged
                        </MainButton>
                      </div>
                    ) : (
                      <span className="text-layout">1</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {returnOrder.status !== ReturnOrderStatus.PROBLEM &&
        returnOrder.status !== ReturnOrderStatus.DONE && (
          <div className="flex justify-end">
            <MainButton
              onClick={getNextAction}
              loading={isAnyActionPending}
              className="!w-[160px]"
            >
              {returnOrder.status === ReturnOrderStatus.CREATED ||
              returnOrder.status === ReturnOrderStatus.PICKED_UP
                ? "Approve Return"
                : returnOrder.status === ReturnOrderStatus.CHECKING
                  ? "Done"
                  : "Order Completed"}
            </MainButton>
          </div>
        )}
    </div>
  );
};

export default EmployeeReturnOrderDetailsPage;
