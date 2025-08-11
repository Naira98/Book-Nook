import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ShoppingCart, Clock, Star } from 'lucide-react';
import type { Book as BookType } from '../../types/client/books';

interface BookCardProps {
  book: BookType;
  onBorrow?: (bookId: number) => void;
  onPurchase?: (bookId: number) => void;
  showActions?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onBorrow,
  onPurchase,
  showActions = true,
}) => {
  const navigate = useNavigate();

  const hasBookDetails = book.book_details && book.book_details.length > 0;
  const canBorrow = hasBookDetails && book.book_details.some(
    detail => detail.status === 'BORROW' && detail.available_stock > 0
  );
  const canPurchase = hasBookDetails && book.book_details.some(
    detail => detail.status === 'PURCHASE' && detail.available_stock > 0
  );

  const handleCardClick = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden fade-in-up flex w-full max-w-3xl h-65 border border-gray-200"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="w-2/5 h-full relative">
        {book.cover_img ? (
          <img
            src={book.cover_img}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Book className="w-16 h-16 text-primary/50" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-sm font-medium shadow">
          {book.price} EGP
        </div>
      </div>

      <div className="w-3/5 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
            {book.title}
          </h3>

          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm text-gray-600">by</span>
            <span className="text-sm font-medium text-primary">{book.author.name}</span>
          </div>

          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {book.category.name}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          {book.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {book.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {canBorrow && (
              <span className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                <span>Available for Borrow</span>
              </span>
            )}
            {canPurchase && (
              <span className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                <ShoppingCart className="w-3 h-3" />
                <span>Available for Purchase</span>
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2 mt-3">
            {canBorrow && onBorrow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBorrow(book.id);
                }}
                className="flex-1 bg-primary hover:bg-hover text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-1"
              >
                <Clock className="w-4 h-4" />
                <span>Borrow</span>
              </button>
            )}
            {canPurchase && onPurchase && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase(book.id);
                }}
                className="flex-1 bg-secondary hover:bg-yellow-500 text-white px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center space-x-1"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;