import { Star } from "lucide-react";
import type { IBorrowBook, IPurchaseBook } from "../../types/Book";
import type { AllCartItemsResponse } from "../../types/Cart";
import { formatMoney } from "../../utils/formatting";
import AddToCartButton from "./AddToCartButton";
import QuantityControl from "./QuantityControl";
import { Link } from "react-router-dom";
import clsx from "clsx";

interface BookCardProps {
  book: IPurchaseBook | IBorrowBook;
  cartItems: AllCartItemsResponse;
}

const HorizontalBookCard = ({ book, cartItems }: BookCardProps) => {
  const isBorrowBook = Object.hasOwn(book, "borrow_fees_per_week");

  // Determine if the book is out of stock
  const isOutOfStock = book.available_stock <= 0;

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
    <div
      className={clsx(
        "flex w-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl",
        { "opacity-60": isOutOfStock },
      )}
    >
      <Link to={`/book/${book.book_details_id}`} className="flex w-full">
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
              {/* Category Tag */}
              <span className="bg-accent text-primary rounded-full px-3 py-1 text-xs font-medium">
                {book.category.name}
              </span>
              {/* Author and Year Tag */}
              <span className="bg-accent text-primary rounded-full px-3 py-1 text-xs font-medium">
                {book.author.name} ({book.publish_year})
              </span>
            </div>

            <h2 className="text-layout text-xl font-bold md:text-2xl">
              {book.title}
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-layout">by {book.author.name}</span>
              <span className="text-layout">•</span>
              <div className="flex items-center gap-1">
                <Star className="fill-secondary text-secondary h-4 w-4" />
                <span className="text-layout text-sm">4.1</span>
              </div>
            </div>

            <p className="text-layout line-clamp-2 text-sm md:text-base">
              {book.description}
            </p>
          </div>
        </div>
      </Link>

      {/* Right Section - Pricing and Add to Cart/Quantity Controls */}
      <div className="border-accent flex w-60 flex-col items-center justify-between border-l p-4 md:p-6">
        <div>
          {isBorrowBook && (
            <div className="flex flex-col justify-center space-y-2">
              <div className="text-primary text-center font-semibold">
                <span className="font-medium">Weekly: </span>
                {formatMoney((book as IBorrowBook).borrow_fees_per_week)} EGP
              </div>
              <div className="text-layout text-center text-sm font-semibold">
                <span className="font-medium">Deposit: </span>
                {formatMoney((book as IBorrowBook).deposit_fees)} EGP
              </div>
            </div>
          )}

          {!isBorrowBook && (
            <div className="space-y-2">
              <div className="text-primary font-semibold">
                <span className="font-medium">Price: </span>
                {formatMoney((book as IPurchaseBook).price)} EGP
              </div>
            </div>
          )}

          {bookInCart && isBorrowBook && (
            <div className="text-success mt-2 text-center text-sm font-semibold">
              In Cart!
              <span className="ml-1">({borrowBookCountInCart})</span>
            </div>
          )}
        </div>

        {isOutOfStock ? (
          <div className="text-error cursor-default text-center font-semibold">
            Out of Stock
          </div>
        ) : isBorrowBook ? (
          <AddToCartButton
            book_details_id={book.book_details_id}
            isBorrowBook={isBorrowBook}
            borrowingLimitExceeded={borrowingLimitExceeded}
            isOutOfStock={isOutOfStock}
          />
        ) : bookInCart ? (
          <QuantityControl item={bookInCart} />
        ) : (
          <AddToCartButton
            book_details_id={book.book_details_id}
            isBorrowBook={isBorrowBook}
            borrowingLimitExceeded={borrowingLimitExceeded}
            isOutOfStock={isOutOfStock}
          />
        )}
      </div>
    </div>
  );
};

export default HorizontalBookCard;
