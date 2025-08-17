import type { AllCartItemsResponse, BorrowItem } from "../../types/Cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatMoney, performDecimalOperation } from "../../utils/formatting";
import { useUpdateCartItem } from "../../hooks/cart/useUpdateCartItem";
import { useQueryClient } from "@tanstack/react-query";
import Spinner from "../shared/Spinner";
import { useDeleteCartItem } from "../../hooks/cart/useDeleteCartItem";
import { useGetMe } from "../../hooks/auth/useGetMe";

export default function BorrowCartItem({
  borrowItem,
}: {
  borrowItem: BorrowItem;
}) {
  const { me } = useGetMe();
  const { updateCartItem, isPending } = useUpdateCartItem();
  const { deleteCartItem, isPending: isDeletePending } = useDeleteCartItem();

  const queryClient = useQueryClient();

  function isBetweenBorrowingWeeksLimit(borrowingWeeks: number) {
    return borrowingWeeks >= 1 && borrowingWeeks <= 4;
  }

  function changeQuantity(newBorrowingWeeks: number) {
    if (!isBetweenBorrowingWeeksLimit(newBorrowingWeeks)) return;
    updateCartItem(
      {
        cart_item_id: borrowItem.id,
        borrowing_weeks: newBorrowingWeeks,
      },
      {
        onSuccess: () => {
          queryClient.setQueryData(
            ["cartItems", me?.id],
            (oldData: AllCartItemsResponse | undefined) => {
              if (oldData != undefined) {
                const newData = { ...oldData };
                newData.borrow_items = newData.borrow_items.map((item) =>
                  item.id === borrowItem.id
                    ? { ...item, borrowing_weeks: newBorrowingWeeks }
                    : item,
                );
                return newData;
              }
            },
          );
        },
      },
    );
  }

  function deleteItem() {
    deleteCartItem(borrowItem.id, {
      onSuccess: () => {
        queryClient.setQueryData(
          ["cartItems", me?.id],
          (oldData: AllCartItemsResponse | undefined) => {
            if (oldData != undefined) {
              const newData = { ...oldData };
              newData.borrow_items = newData.borrow_items.filter(
                (item) => item.id !== borrowItem.id,
              );
              return newData;
            }
          },
        );
      },
    });
  }

  return (
    <tr className="border-b border-gray-100">
      <td className="px-2 py-4">
        <div className="flex items-center space-x-3">
          <img
            src={borrowItem.book.cover_img}
            alt={borrowItem.book.title}
            className="h-20 w-16 rounded-md object-cover shadow-sm"
          />
          <div>
            <p className="font-medium text-gray-900">{borrowItem.book.title}</p>
            <p className="text-sm text-gray-600">
              {borrowItem.book.author.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <button
            disabled={
              !isBetweenBorrowingWeeksLimit(borrowItem.borrowing_weeks - 1) ||
              isPending
            }
            onClick={() => {
              changeQuantity(borrowItem.borrowing_weeks - 1);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
          >
            <Minus className="h-4 w-4 text-gray-600" />
          </button>
          <span className="flex w-12 items-center justify-center text-center font-medium">
            {isPending ? (
              <Spinner className="!text-black" />
            ) : (
              borrowItem.borrowing_weeks || 0
            )}
          </span>
          <button
            disabled={
              !isBetweenBorrowingWeeksLimit(borrowItem.borrowing_weeks + 1) ||
              isPending
            }
            onClick={() => {
              changeQuantity(borrowItem.borrowing_weeks + 1);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </td>
      <td className="px-2 py-4 text-center font-medium text-gray-900">
        ${formatMoney(borrowItem.borrow_fees_per_week)}
      </td>

      <td className="px-2 py-4 text-center font-medium text-gray-900">
        $
        {performDecimalOperation(
          borrowItem.borrow_fees_per_week,
          "*",
          borrowItem.borrowing_weeks,
        )}
      </td>
      <td className="px-2 py-4 text-center">
        <button
          disabled={isDeletePending}
          onClick={deleteItem}
          className="rounded-md p-2 text-red-500 transition-colors hover:bg-red-50"
        >
          {isDeletePending ? (
            <Spinner className="!text-black" />
          ) : (
            <Trash2 className="h-5 w-5" />
          )}
        </button>
      </td>
    </tr>
  );
}
