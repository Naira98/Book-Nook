import { Minus, Plus, Trash2 } from "lucide-react";
import { useDeleteCartItem } from "../../hooks/cart/useDeleteCartItem";
import { useUpdateCartItem } from "../../hooks/cart/useUpdateCartItem";
import type {
  AllCartItemsResponse,
  BorrowItem,
  PurchaseItem,
} from "../../types/Cart";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe } from "../../hooks/auth/useGetMe";

interface QuantityControlProps {
  item: PurchaseItem | BorrowItem;
}

const QuantityControl = ({ item }: QuantityControlProps) => {
  const { updateCartItem, isPending: isPendingUpdatingCartItem } =
    useUpdateCartItem();

  const { deleteCartItem, isPending: isPendingDeleteCartItem } =
    useDeleteCartItem();

  const queryClient = useQueryClient();
  const { me } = useGetMe();

  const currentQuantity = (item as PurchaseItem).quantity;

  const onUpdateQuantity = (newQuantity: number) => {
    updateCartItem(
      {
        cart_item_id: item.id,
        quantity: newQuantity,
      },
      {
        onSuccess: () => {
          queryClient.setQueryData(
            ["cartItems", me!.id],
            (oldData: AllCartItemsResponse | undefined) => {
              if (oldData) {
                const newData = { ...oldData };
                newData.purchase_items = newData.purchase_items.map(
                  (purchaseItem) =>
                    purchaseItem.id === item.id
                      ? { ...purchaseItem, quantity: newQuantity }
                      : purchaseItem,
                );
                return newData;
              }
            },
          );
        },
      },
    );
  };

  const onDeleteItem = () => {
    deleteCartItem(item.id, {
      onSuccess: () => {
        queryClient.setQueryData(
          ["cartItems", me!.id],
          (oldData: AllCartItemsResponse | undefined) => {
            if (oldData) {
              const newData = { ...oldData };
              newData.purchase_items = newData.purchase_items.filter(
                (purchaseItem) => purchaseItem.id !== item.id,
              );
              return newData;
            }
          },
        );
      },
    });
  };

  const isDisabled = isPendingUpdatingCartItem || isPendingDeleteCartItem;

  const isDeleteButton = currentQuantity === 1;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      {/* Minus Button / Delete Button */}
      <button
        onClick={
          isDeleteButton
            ? () => onDeleteItem()
            : () => onUpdateQuantity(currentQuantity - 1)
        }
        disabled={isDisabled}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
          isDeleteButton
            ? "bg-error focus:ring-error text-white hover:bg-red-500"
            : "bg-accent text-layout focus:ring-primary hover:bg-slate-200"
        }`}
      >
        {isDeleteButton ? (
          <Trash2 className="h-4 w-4" />
        ) : (
          <Minus className="h-4 w-4" />
        )}
      </button>

      {/* Quantity Display */}
      <span className="text-primary text-lg font-semibold">
        {currentQuantity}
      </span>

      {/* Plus Button */}
      <button
        onClick={() => onUpdateQuantity(currentQuantity + 1)}
        disabled={isPendingUpdatingCartItem}
        className={
          "bg-primary hover:bg-hover focus:ring-primary flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantityControl;
