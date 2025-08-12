import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Heart,
  Plus,
  Minus,
  ChevronRight
} from 'lucide-react';
import { useBook } from '../../hooks/useBook';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const {
    book,
    isLoading,
    error,
    borrowMutation,
    purchaseMutation,
    canBorrow,
    canPurchase,
    isError,
    isFetching
  } = useBook(id);

  const handleBorrow = () => {
    if (!book) return;
    borrowMutation.mutate(book.id);
  };

  const handlePurchase = () => {
    if (!book) return;
    purchaseMutation.mutate(book.id);
  };

  // const toggleFavorite = () => {
  //   setIsFavorite(!isFavorite);
  // };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-primary">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Book Not Found</h2>
          <p className="text-primary mb-6">
            {error instanceof Error ? error.message : 'The book you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-primary hover:bg-hover text-white px-6 py-2 rounded-md font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Mock data for the design
  const originalPrice = book.price * 1.66; // 40% discount
  const rating = 4.5;
  const reviewCount = 127;
  const overallRating = 4.7;
  const ratingDistribution = {
    5: 86,
    4: 10,
    3: 1,
    2: 0,
    1: 0
  };

  const relatedBooks = [
    { id: 1, title: "Such a Fun Age", author: "Kiley Reid", price: 21.4, rating: 4.5, cover: "https://via.placeholder.com/80x120" },
    { id: 2, title: "Be Loud If It's Never Remember", author: "Author Name", price: 21.4, rating: 4.5, cover: "https://via.placeholder.com/80x120" },
    { id: 3, title: "Electronic Basic", author: "Author Name", price: 21.4, rating: 4.5, cover: "https://via.placeholder.com/80x120" },
    { id: 4, title: "Life of Wilds", author: "Author Name", price: 21.4, rating: 4.5, cover: "https://via.placeholder.com/80x120" }
  ];

  const relatedItems = [
    { id: 1, title: "Story of Everest", author: "Henry Mortopo", price: 21.99, category: "Adventure", rating: 4.5, cover: "https://via.placeholder.com/120x160" },
    { id: 2, title: "Life of Wilds", author: "Jasmine Belle", price: 24.99, category: "Nature", rating: 4.5, cover: "https://via.placeholder.com/120x160" },
    { id: 3, title: "So You Want To Talk About Race", author: "Ijeoma Oluo", price: 15.63, category: "Biography", rating: 4.5, cover: "https://via.placeholder.com/120x160" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Book Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Left Column - Book Info */}
            <div className="lg:col-span-2 h-full flex flex-col">
              {/* Rating and Title */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-secondary fill-current" />
                  <span className="text-lg font-semibold">{rating}</span>
                  <span className="text-primary">({reviewCount} Reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-primary mb-4">
                {book.title}
              </h1>

              {/* Author */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-primary font-medium">{book.author.name}</span>
              </div>

              {/* Description */}
              <p className="text-primary mb-6 leading-relaxed">
                {book.description }
              </p>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-primary">${book.price}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-primary font-medium">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 "
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 "
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-8 space-y-4 lg:space-y-0 lg:space-x-4">
                <button
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  className="bg-primary hover:bg-hover disabled:bg-gray-400 text-white px-8 py-3 rounded-md font-medium flex items-center space-x-2 transition-colors"
                >
                  {purchaseMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
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
            <div className="lg:col-span-1 ">
              <div className="space-y-4 h-full">
                {/* Main Cover */}
                <div className="relative">
                  {book.cover_img ? (
                    <img
                      src={book.cover_img}
                      alt={book.title}
                      className="w-full h-120 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-120 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-primary">No Cover Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
       <div className="flex flex-col lg:flex-row gap-8 mb-8">
  {/* Details Section */}
  <div className="bg-white rounded-lg shadow-sm p-8 flex-1">
    <h2 className="text-2xl font-bold text-primary mb-6">Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  <div className="bg-white rounded-lg shadow-sm p-8 w-full lg:w-1/3">
    <h2 className="text-2xl font-bold text-primary mb-6">Customer Reviews</h2>
    <div className="grid grid-cols-1 gap-8">
      <div className="text-center">
        <div className="text-4xl font-bold text-primary mb-2">{overallRating}</div>
        <div className="text-primary mb-2">out of 5</div>
        <div className="flex justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-6 h-6 text-secondary fill-current" />
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
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">Related Items</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedItems.map((item) => (
              <div key={item.id} className="relative">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-secondary text-white text-xs px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-secondary fill-current" />
                  <span className="text-sm">{item.rating}</span>
                </div>
                <h3 className="font-medium text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-primary mb-2">{item.author}</p>
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