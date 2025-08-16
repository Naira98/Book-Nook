import { Star } from "lucide-react";
import type { IBorrowBook, IPurchaseBook } from "../../types/Book";
import type { AllCartItemsResponse } from "../../types/Cart";
import { formatMoney } from "../../utils/formatting";
import AddToCartButton from "./AddToCartButton";
import QuantityControl from "./QuantityControl";

interface BookCardProps {
  book: IPurchaseBook | IBorrowBook;
  cartItems: AllCartItemsResponse;
}

const BookCard = ({ book, cartItems }: BookCardProps) => {
  const isBorrowBook = Object.hasOwn(book, "borrow_fees_per_week");

  const bookInCart = isBorrowBook
    ? cartItems?.borrow_items.find(
        (item) => item.book_details_id === book.book_details_id,
      )
    : cartItems?.purchase_items.find(
        (item) => item.book_details_id === book.book_details_id,
      );

  const borrowBookCountInCart =
    isBorrowBook && cartItems?.borrow_items
      ? cartItems.borrow_items.filter(
          (item) => item.book_details_id === book.book_details_id,
        ).length
      : 0;

  const borrowingLimitExceeded =
    isBorrowBook && cartItems.remaining_borrow_books_count <= 0;

  return (
    <div className="flex w-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Left Section - Book Cover */}
      <div className="w-32 flex-shrink-0 md:w-40">
        <div className="h-full w-full">
          <img
            src={book.cover_img}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Middle Section - Book Details */}
      <div className="flex flex-1 flex-col justify-between p-4 md:p-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {book.category.name}
            </span>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
              {book.author.name} ({book.publish_year})
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
            {book.title}
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">by {book.author.name}</span>
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
              <span className="text-sm text-gray-600">4.1</span>
            </div>
          </div>

          <p className="line-clamp-2 text-sm text-gray-600 md:text-base">
            {book.description}
          </p>
        </div>
      </div>

      {/* Right Section - Pricing and Add to Cart/Quantity Controls */}
      <div className="flex w-48 flex-col items-center justify-between border-l border-gray-100 p-4 md:p-6">
        <div>
          {isBorrowBook && (
            <div className="flex flex-col justify-center space-y-2">
              <div className="text-primary text-center font-semibold">
                <span className="font-medium">Weekly: </span>
                {formatMoney((book as IBorrowBook).borrow_fees_per_week)} EGP
              </div>
              <div className="text-center text-sm font-semibold text-gray-600">
                <span className="font-medium">Deposit: </span>
                {formatMoney((book as IBorrowBook).deposit_fees)} EGP
              </div>
            </div>
          )}

          {!isBorrowBook && (
            <div className="space-y-2">
              <div className="text-primary font-semibold">
                {formatMoney((book as IPurchaseBook).price)} EGP
              </div>
            </div>
          )}

          {bookInCart && isBorrowBook && (
            <div className="mt-2 text-center text-sm font-semibold text-green-600">
              In Cart!
              <span className="ml-1">({borrowBookCountInCart})</span>
            </div>
          )}
        </div>

        {isBorrowBook ? (
          <AddToCartButton
            book_details_id={book.book_details_id}
            isBorrowBook={isBorrowBook}
            borrowingLimitExceeded={borrowingLimitExceeded}
          />
        ) : bookInCart ? (
          <QuantityControl item={bookInCart} />
        ) : (
          <AddToCartButton
            book_details_id={book.book_details_id}
            isBorrowBook={isBorrowBook}
            borrowingLimitExceeded={borrowingLimitExceeded}
          />
        )}
      </div>
    </div>
  );
};

export default BookCard;
