import { ShoppingCart } from "lucide-react";
import { useAddCartItem } from "../../hooks/cart/useAddCartItem";
import { useState } from "react";

interface AddToCartButtonProps {
  book_details_id: number;
  isBorrowBook: boolean;
  borrowingLimitExceeded: boolean;
  isOutOfStock: boolean;
}

const AddToCartButton = ({
  book_details_id,
  isBorrowBook,
  borrowingLimitExceeded,
  isOutOfStock,
}: AddToCartButtonProps) => {
  const { addCartItem, isPending: isPendingAddingToCart } = useAddCartItem();
  const [showTooltip, setShowTooltip] = useState(false);
  const onAddToCart = () => {
    addCartItem({
      book_details_id,
      quantity: 1,
      borrowing_weeks: 1,
    });
  };

  const isDisabled =
    isPendingAddingToCart ||
    isOutOfStock ||
    (isBorrowBook && borrowingLimitExceeded);

  const buttonClasses =
    "mt-4 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer bg-secondary hover:bg-orange-500 focus:ring-secondary";

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => {
        if (isDisabled) {
          setShowTooltip(true);
        }
      }}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={onAddToCart}
        disabled={isDisabled}
        className={buttonClasses}
      >
        {isPendingAddingToCart ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        ) : isOutOfStock ? (
          <span className="text-xs">OUT OF STOCK</span>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs">ADD TO CART</span>
          </>
        )}
      </button>

      {/* Tooltip message */}
      {isDisabled && showTooltip && (
        <div className="bg-layout absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-lg px-3 py-1 text-xs whitespace-nowrap text-white shadow-lg">
          {isOutOfStock
            ? "This book is out of stock!"
            : "Borrowing limit exceeded!"}
          <div className="border-t-layout absolute bottom-[-4px] left-1/2 h-0 w-0 -translate-x-1/2 border-t-4 border-r-4 border-l-4 border-r-transparent border-l-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
