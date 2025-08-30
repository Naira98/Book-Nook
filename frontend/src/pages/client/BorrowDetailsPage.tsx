import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../../components/client/AddToCartButton";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import { useGetBorrowBookDetails } from "../../hooks/books/useGetBorrowBookDetails";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { formatMoney } from "../../utils/formatting";

const BorrowDetailsPage = () => {
  const { bookDetailsId } = useParams<{ bookDetailsId: string }>();
  const navigate = useNavigate();

  const { bookDetails, isPending: isPendingGettingBorrowDetails } =
    useGetBorrowBookDetails(bookDetailsId);
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();

  if (isPendingGettingBorrowDetails || isPendingGettingCartItems) {
    return <FullScreenSpinner />;
  }

  const bookInCart = cartItems!.borrow_items.find(
    (item) => item.book_details_id === Number(bookDetailsId),
  );

  const borrowBookCountInCart = cartItems!.borrow_items
    ? cartItems!.borrow_items.filter(
        (item) => item.book_details_id === Number(bookDetailsId),
      ).length
    : 0;

  const borrowingLimitExceeded = cartItems!.remaining_borrow_books_count <= 0;

  if (!bookDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-primary mb-4 text-2xl font-bold">
            Book Not Found
          </h2>
          <p className="text-primary mb-6">
            The book you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary hover:bg-hover rounded-md px-6 py-2 font-medium text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const rating = parseFloat(bookDetails.rating);
  const isOutOfStock = bookDetails.available_stock <= 0;

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-lg bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
            <div className="flex h-full flex-col lg:col-span-2">
              <div className="mb-6 flex items-center space-x-4">
                <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, index) => {
                      const filled = index < Math.floor(rating);
                      const isHalf =
                        rating - Math.floor(rating) > 0 &&
                        index === Math.floor(rating);
                      return (
                        <Star
                          key={index}
                          className={`h-5 w-5 transition-all duration-200 ${
                            filled || isHalf
                              ? "text-yellow-500"
                              : "text-gray-300"
                          } ${filled ? "fill-current" : isHalf ? "fill-yellow-500" : ""}`}
                        />
                      );
                    })}
                  </div>
                  <span className="ml-2 text-lg font-bold text-gray-800">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-600">/ 5</span>
                </div>
              </div>

              <h1 className="text-primary mb-4 text-3xl font-bold">
                {bookDetails.title}
              </h1>

              {/* Author */}
              <div className="mb-6 flex items-center space-x-3">
                <span className="text-primary font-medium">
                  {bookDetails.author.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-primary mb-6 leading-relaxed">
                {bookDetails.description}
              </p>

              {/* Pricing */}
              <div className="mb-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-primary text-xl font-semibold">
                      Borrow Fee:{" "}
                      {formatMoney(bookDetails.borrow_fees_per_week)} EGP / week
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-primary text-xl font-semibold">
                      Deposit: {formatMoney(bookDetails.deposit_fees)} EGP
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-primary text-lg">
                      Total:{" "}
                      {formatMoney(
                        (
                          parseFloat(bookDetails.borrow_fees_per_week) * 1 +
                          parseFloat(bookDetails.deposit_fees)
                        ).toFixed(2),
                      )}{" "}
                      EGP
                      <span className="ml-1 text-sm text-gray-500">
                        (for 1 week)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-start space-y-4">
                <AddToCartButton
                  book_details_id={bookDetails.book_details_id}
                  isBorrowBook={true}
                  borrowingLimitExceeded={borrowingLimitExceeded}
                  isOutOfStock={isOutOfStock}
                />

                {/* Cart indicator */}
                {bookInCart && (
                  <div className="text-success mt-2 cursor-default text-center text-sm font-semibold">
                    In Cart!
                    <span className="ml-1">({borrowBookCountInCart})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Book Covers */}
            <div className="lg:col-span-1">
              <div className="h-full space-y-4">
                {/* Main Cover */}
                <div className="relative">
                  {bookDetails.cover_img ? (
                    <img
                      src={bookDetails.cover_img}
                      alt={bookDetails.title}
                      className="h-120 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-120 w-full items-center justify-center rounded-lg bg-gray-200">
                      <span className="text-primary">No Cover Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="mb-8 flex flex-col gap-8 lg:flex-row">
          {/* Details Section */}
          <div className="flex-1 rounded-lg bg-white p-8 shadow-sm">
            <h2 className="text-primary mb-6 text-2xl font-bold">Details</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <span className="text-primary">Book Title:</span>
                <p className="font-medium">{bookDetails.title}</p>
              </div>
              <div>
                <span className="text-primary">Author:</span>
                <p className="font-medium">{bookDetails.author.name}</p>
              </div>
              <div>
                <span className="text-primary">Publish Year:</span>
                <p className="font-medium">{bookDetails.publish_year}</p>
              </div>
              <div>
                <span className="text-primary">Category:</span>
                <p className="font-medium">{bookDetails.category.name}</p>
              </div>
              <div>
                <span className="text-primary">Available Stock:</span>
                <p className="font-medium">{bookDetails.available_stock}</p>
              </div>
              <div>
                <span className="text-primary">Borrow Fee:</span>
                <p className="font-medium">
                  {formatMoney(bookDetails.borrow_fees_per_week)} EGP / week
                </p>
              </div>
              <div>
                <span className="text-primary">Deposit Fee:</span>
                <p className="font-medium">
                  {formatMoney(bookDetails.deposit_fees)} EGP
                </p>
              </div>
              <div>
                <span className="text-primary">Rating:</span>
                <p className="font-medium">{bookDetails.rating}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Customer Reviews Section */}
          <div className="w-full rounded-lg bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg lg:w-1/3">
            <h2 className="text-primary mb-6 flex items-center text-2xl font-bold">
              <Star className="mr-2 h-6 w-6 text-yellow-500" />
              Customer Reviews
            </h2>
            <div className="text-center">
              {/* Main Rating Display */}
              <div className="mb-6">
                <div className="mb-2 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-5xl font-bold text-transparent">
                  {rating.toFixed(1)}
                </div>
                <div className="mb-4 text-lg text-gray-600">out of 5</div>

                {/* Enhanced Star Display */}
                <div className="mb-4 flex justify-center space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const filled = index < Math.floor(rating);
                    const isHalf =
                      rating - Math.floor(rating) > 0 &&
                      index === Math.floor(rating);
                    return (
                      <Star
                        key={index}
                        className={`h-8 w-8 transition-all duration-300 hover:scale-110 ${
                          filled || isHalf ? "text-yellow-500" : "text-gray-300"
                        } ${filled ? "fill-current" : isHalf ? "fill-yellow-500" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowDetailsPage;
