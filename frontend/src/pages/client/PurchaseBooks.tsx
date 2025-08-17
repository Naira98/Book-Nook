import React, { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Clock } from "lucide-react";
import type { Book } from "../../types/client/books";
import SearchBar from "../../components/client/SearchBar";
import BookCard from "../../components/client/BookCard";
import { purchaseBooksDummy } from "../../data/mockData";
import { formatMoney } from "../../utils/formatting";

const PurchaseBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(purchaseBooksDummy);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    setBooks(purchaseBooksDummy);
  }, []);

  const handleSearch = (
    query: string,
    filters: { category: string; status: string },
  ) => {
    setLoading(true);
    let filteredBooks = [...purchaseBooksDummy];

    if (query) {
      const searchQuery = query.toLowerCase();
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery) ||
          book.author.name.toLowerCase().includes(searchQuery) ||
          book.description.toLowerCase().includes(searchQuery),
      );
    }

    if (filters.category) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.category.name.toLowerCase() === filters.category.toLowerCase(),
      );
    }

    if (filters.status === "purchase") {
      filteredBooks = filteredBooks.filter(
        (book) => book.book_details[0].status === "PURCHASE",
      );
    }

    setBooks(filteredBooks);
    setLoading(false);
  };

  const addToCart = (bookId: number) => {
    setCart((prev) => ({
      ...prev,
      [bookId]: (prev[bookId] || 0) + 1,
    }));
  };

  const removeFromCart = (bookId: number) => {
    setCart((prev) => {
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
      const book = allBooks.find((b) => b.id === parseInt(bookId));
      const bookPrice = book ? parseFloat(formatMoney(book.price)) : 0;
      return total + bookPrice * quantity;
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
        <div
          className="animate-fadeInUp mb-8 opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-black">
                Purchase Books
              </h1>
              <p className="text-gray-600">
                Discover and buy books from our wide collection
              </p>
            </div>
            {getCartItemCount() > 0 && (
              <div
                className="animate-fadeInUp rounded-lg bg-white p-4 opacity-0 shadow-md"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <ShoppingCart className="text-primary h-6 w-6" />
                    <span className="bg-secondary absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
                      {getCartItemCount()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cart Total</p>
                    <p className="text-primary text-lg font-bold">
                      {getCartTotal().toFixed(2)} EGP
                    </p>
                  </div>
                  <button className="bg-primary hover:bg-hover rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-200">
                    Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="animate-fadeInUp mx-auto mb-8 w-full max-w-4xl opacity-0"
          style={{ animationDelay: "0.3s" }}
        >
          <SearchBar pageType="purchase" onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {books.map((book, index) => (
              <div
                key={`${book.id}-${index}`}
                className="animate-fadeInUp w-full cursor-pointer overflow-hidden rounded-xl bg-white opacity-0 shadow-md transition-transform duration-200 hover:scale-[1.03]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BookCard book={book} />
                <div className="px-4 pt-2 pb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-l text-primary font-bold">
                      {formatMoney(book.price)} EGP
                    </span>
                    <span className="text-sm text-gray-600">
                      Available: {book.book_details[0]?.available_stock || 0}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    {cart[book.id] ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(book.id)}
                          className="flex h-6 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200 hover:bg-gray-300"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center text-lg font-medium text-black">
                          {cart[book.id]}
                        </span>
                        <button
                          onClick={() => addToCart(book.id)}
                          className="flex h-6 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors duration-200 hover:bg-gray-300"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <span className="text-primary ml-4 text-sm font-medium">
                          {parseFloat(formatMoney(book.price)) * cart[book.id]}{" "}
                          EGP
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(book.id)}
                        className="bg-secondary flex items-center space-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-yellow-500 hover:shadow-lg"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="animate-fadeInUp py-12 text-center opacity-0"
            style={{ animationDelay: "0.4s" }}
          >
            <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-medium text-black">
              No books found
            </h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseBooks;
