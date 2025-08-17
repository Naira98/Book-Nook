import { Clock } from "lucide-react";
import React from "react";
import BookCard from "../../components/client/BookCard";
import Spinner from "../../components/shared/Spinner";
import { useGetPurchaseBooks } from "../../hooks/books/useGetPruchaseBooks";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";

const PurchaseBooksPage: React.FC = () => {
  const { purchaseBooks, isPending: isPendingGettingBooks } =
    useGetPurchaseBooks();
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();

  if (isPendingGettingBooks || isPendingGettingCartItems) return <Spinner />;

  if (!cartItems) return <div>No cart data available.</div>;

  return (
    <div className="min-h-screen bg-[#dfe8ef] font-sans">
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
          </div>
        </div>

        <div
          className="animate-fadeInUp mx-auto mb-8 w-full max-w-4xl opacity-0"
          style={{ animationDelay: "0.3s" }}
        >
          {/* <SearchBar pageType="purchase" onSearch={handleSearch} /> */}
        </div>

        {purchaseBooks && purchaseBooks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {purchaseBooks.map((book) => (
              <BookCard
                book={book}
                cartItems={cartItems}
                key={book.book_details_id}
              />
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

export default PurchaseBooksPage;
