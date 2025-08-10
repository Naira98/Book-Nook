import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Clock } from 'lucide-react';
import type { Book } from '../../types/client/books';
import SearchBar from '../../components/client/SearchBar';
import BookCard from '../../components/client/BookCard';
import { purchaseBooksDummy } from '../../data/mockData';

const PurchaseBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(purchaseBooksDummy);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    setBooks(purchaseBooksDummy);
  }, []);

  const handleSearch = (query: string, filters: { category: string; status: string }) => {
    setLoading(true);
    let filteredBooks = [...purchaseBooksDummy];

    if (query) {
      const searchQuery = query.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.name.toLowerCase().includes(searchQuery) ||
        book.description.toLowerCase().includes(searchQuery)
      );
    }

    if (filters.category) {
      filteredBooks = filteredBooks.filter(
        book => book.category.name.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.status === 'purchase') {
      filteredBooks = filteredBooks.filter(
        book => book.book_details[0].status === 'PURCHASE'
      );
    }

    setBooks(filteredBooks);
    setLoading(false);
  };

  const addToCart = (bookId: number) => {
    setCart(prev => ({
      ...prev,
      [bookId]: (prev[bookId] || 0) + 1,
    }));
  };

  const removeFromCart = (bookId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[bookId] > 1) {
        newCart[bookId] -= 1;
      } else {
        delete newCart[bookId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    const allBooks = books.length > 0 ? books : purchaseBooksDummy;
    return Object.entries(cart).reduce((total, [bookId, quantity]) => {
      const book = allBooks.find(b => b.id === parseInt(bookId));
      return total + (book ? book.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  return (
    <div className="min-h-screen bg-[#dfe8ef] font-sans">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Purchase Books</h1>
              <p className="text-gray-600">Discover and buy books from our wide collection</p>
            </div>
            {getCartItemCount() > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-md animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cart Total</p>
                    <p className="text-lg font-bold text-primary">{getCartTotal().toFixed(2)} EGP</p>
                  </div>
                  <button className="bg-primary hover:bg-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto mb-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.3s' }}>
          <SearchBar pageType="purchase" onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book, index) => (
              <div
                key={`${book.id}-${index}`}
                className="animate-fadeInUp opacity-0 w-full cursor-pointer bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BookCard book={book} />
                <div className="px-4 pb-4 pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-l font-bold text-primary">{book.price.toFixed(2)} EGP</span>
                    <span className="text-sm text-gray-600">Available: {book.book_details[0]?.available_stock || 0}</span>
                  </div>
                  <div className="flex justify-end">
                    {cart[book.id] ? (
                      <div className="flex items-center space-x-2">
                        <button onClick={() => removeFromCart(book.id)} className="w-8 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-medium text-black min-w-[2rem] text-center">
                          {cart[book.id]}
                        </span>
                        <button onClick={() => addToCart(book.id)} className="w-8 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200">
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-primary ml-4">
                          {(book.price * cart[book.id]).toFixed(2)} EGP
                        </span>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(book.id)} className="bg-secondary hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg">
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s' }}>
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">No books found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseBooks;
