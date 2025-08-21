import { Minus, Plus } from "lucide-react";
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
    <div className="border-accent mt-4 flex items-center justify-center gap-4 rounded-full border-1 p-1 shadow">
      {/* Minus Button / Delete Button */}
      <button
        onClick={
          isDeleteButton
            ? () => onDeleteItem()
            : () => onUpdateQuantity(currentQuantity - 1)
        }
        disabled={isDisabled}
        className={
          "bg-accent text-layout flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-slate-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <Minus className="h-4 w-4" />
      </button>

      {/* Quantity Display */}
      <span className="text-primary text-lg font-bold">{currentQuantity}</span>

      {/* Plus Button */}
      <button
        onClick={() => onUpdateQuantity(currentQuantity + 1)}
        disabled={isPendingUpdatingCartItem}
        className={
          "bg-accent text-layout flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 hover:bg-slate-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
};

export default QuantityControl;
