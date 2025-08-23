import { Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../../components/client/AddToCartButton";
import QuantityControl from "../../components/client/QuantityControl";
import Spinner from "../../components/shared/Spinner";
import { useGetPurchaseBookDetails } from "../../hooks/books/useGetPurchaseBookDetails";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { formatMoney } from "../../utils/formatting";

const PurchaseDetailsPage = () => {
  const { bookDetailsId } = useParams<{ bookDetailsId: string }>();
  const navigate = useNavigate();

  const { bookDetails, isPending: isPendingGettingPurchaseDetails } =
    useGetPurchaseBookDetails(bookDetailsId);
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();

  if (isPendingGettingPurchaseDetails || isPendingGettingCartItems) {
    return <Spinner />;
  }

  const bookInCart = cartItems!.purchase_items.find(
    (item) => item.book_details_id === Number(bookDetailsId),
  );

  const isOutOfStock = bookDetails ? bookDetails.available_stock <= 0 : false;

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

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Book Information Section */}
        <div className="mb-8 rounded-lg bg-white p-8 shadow-sm">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
            {/* Left Column - Book Info */}
            <div className="flex h-full flex-col lg:col-span-2">
              {/* Rating and Title */}
              <div className="mb-4 flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="text-secondary h-5 w-5 fill-current" />
                  <span className="text-lg font-semibold">{rating}</span>
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
                    <span className="text-primary text-3xl font-bold">
                      {formatMoney(bookDetails.price)} EGP
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-start space-y-4">
                {bookInCart ? (
                  <QuantityControl item={bookInCart} />
                ) : (
                  <AddToCartButton
                    book_details_id={bookDetails.book_details_id}
                    isBorrowBook={false}
                    borrowingLimitExceeded={false}
                    isOutOfStock={isOutOfStock}
                  />
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
                <span className="text-primary">Price:</span>
                <p className="font-medium">
                  {formatMoney(bookDetails.price)} EGP
                </p>
              </div>
              <div>
                <span className="text-primary">Rating:</span>
                <p className="font-medium">{bookDetails.rating}</p>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="w-full rounded-lg bg-white p-8 shadow-sm lg:w-1/3">
            <h2 className="text-primary mb-6 text-2xl font-bold">
              Customer Reviews
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <div className="text-center">
                <div className="text-primary mb-2 text-4xl font-bold">
                  {rating.toFixed(1)}
                </div>
                <div className="text-primary mb-2">out of 5</div>
                <div className="mb-4 flex justify-center space-x-1">
                  {[...Array(5)].map((_, index) => {
                    const filled = index < Math.floor(rating);
                    const isHalf =
                      rating - Math.floor(rating) > 0 &&
                      index === Math.floor(rating);
                    return (
                      <Star
                        key={index}
                        className={`h-6 w-6 ${
                          filled || isHalf ? "text-secondary" : "text-accent"
                        } ${filled ? "fill-current" : isHalf ? "fill-accent" : ""}`}
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

export default PurchaseDetailsPage;
