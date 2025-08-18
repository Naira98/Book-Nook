import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBook } from "../../hooks/useBook";

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { book, isLoading, error, purchaseMutation } = useBook(id);

  const handlePurchase = () => {
    if (!book) return;
    purchaseMutation.mutate(book.id);
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2"></div>
          <p className="text-primary text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-primary mb-4 text-2xl font-bold">
            Book Not Found
          </h2>
          <p className="text-primary mb-6">
            {error instanceof Error
              ? error.message
              : "The book you are looking for does not exist."}
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

  const rating = 4.5;
  const reviewCount = 127;
  const overallRating = 4.7;

  const relatedItems = [
    {
      id: 1,
      title: "Story of Everest",
      author: "Henry Mortopo",
      price: 21.99,
      category: "Adventure",
      rating: 4.5,
      cover: "https://via.placeholder.com/120x160",
    },
    {
      id: 2,
      title: "Life of Wilds",
      author: "Jasmine Belle",
      price: 24.99,
      category: "Nature",
      rating: 4.5,
      cover: "https://via.placeholder.com/120x160",
    },
    {
      id: 3,
      title: "So You Want To Talk About Race",
      author: "Ijeoma Oluo",
      price: 15.63,
      category: "Biography",
      rating: 4.5,
      cover: "https://via.placeholder.com/120x160",
    },
  ];

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
                  <span className="text-primary">({reviewCount} Reviews)</span>
                </div>
              </div>

              <h1 className="text-primary mb-4 text-3xl font-bold">
                {book.title}
              </h1>

              {/* Author */}
              <div className="mb-6 flex items-center space-x-3">
                <span className="text-primary font-medium">
                  {book.author.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-primary mb-6 leading-relaxed">
                {book.description}
              </p>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-primary text-3xl font-bold">
                    ${book.price}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-primary font-medium">Quantity:</span>
                <div className="flex items-center rounded-md border border-gray-300">
                  <button onClick={decreaseQuantity} className="p-2">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="border-x border-gray-300 px-4 py-2">
                    {quantity}
                  </span>
                  <button onClick={increaseQuantity} className="p-2">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-y-4 space-x-8 lg:space-y-0 lg:space-x-4">
                <button
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  className="bg-primary hover:bg-hover flex items-center space-x-2 rounded-md px-8 py-3 font-medium text-white transition-colors disabled:bg-gray-400"
                >
                  {purchaseMutation.isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-full transition-colors ${isFavorite
                    ? 'text-red-500 bg-red-50'
                    : 'text-primary hover:text-red-500 hover:bg-red-50'
                    }`}
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button> */}
              </div>
            </div>

            {/* Right Column - Book Covers */}
            <div className="lg:col-span-1">
              <div className="h-full space-y-4">
                {/* Main Cover */}
                <div className="relative">
                  {book.cover_img ? (
                    <img
                      src={book.cover_img}
                      alt={book.title}
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
                <p className="font-medium">{book.title}</p>
              </div>
              <div>
                <span className="text-primary">Author:</span>
                <p className="font-medium">{book.author.name}</p>
              </div>
              <div>
                <span className="text-primary">Publish Year:</span>
                <p className="font-medium">{book.publish_year}</p>
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
                  {overallRating}
                </div>
                <div className="text-primary mb-2">out of 5</div>
                <div className="mb-4 flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="text-secondary h-6 w-6 fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rating Distribution
            <div className="lg:col-span-2">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm text-primary w-8">{rating} stars</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${ratingDistribution[rating as keyof typeof ratingDistribution]}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-primary w-12">{ratingDistribution[rating as keyof typeof ratingDistribution]}%</span>
                  </div>
                ))}
              </div>
              <button className="mt-6 bg-primary hover:bg-hover text-white px-6 py-2 rounded-md font-medium">
                View reviews
              </button>
            </div> */}
          </div>
        </div>

        {/* Related Items Section */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-primary text-2xl font-bold">Related Items</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedItems.map((item) => (
              <div key={item.id} className="relative">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="mb-3 h-40 w-full rounded-lg object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-secondary rounded px-2 py-1 text-xs text-white">
                    {item.category}
                  </span>
                </div>
                <div className="mb-1 flex items-center space-x-1">
                  <Star className="text-secondary h-4 w-4 fill-current" />
                  <span className="text-sm">{item.rating}</span>
                </div>
                <h3 className="text-primary mb-1 font-medium">{item.title}</h3>
                <p className="text-primary mb-2 text-sm">{item.author}</p>
                <p className="text-primary font-bold">${item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
