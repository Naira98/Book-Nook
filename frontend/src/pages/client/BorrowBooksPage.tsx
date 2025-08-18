import { Clock } from "lucide-react";
import Spinner from "../../components/shared/Spinner";
import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import HorizontalBookCard from "../../components/client/HorizontalBookCard";

const BorrowBooksPage = () => {
  const { borrowBooks, isPending: isPendingGettingBooks } = useGetBorrowBooks();
  const { cartItems, isPending: isPendingGettingCartItems } = useGetCartItems();

  if (isPendingGettingBooks || isPendingGettingCartItems) return <Spinner />;

  if (!cartItems) return <div>No cart data available.</div>;

  return (
    <div className="min-h-screen bg-[#dfe8ef] font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div
          className="animate-fadeInUp mb-8 opacity-0"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="mb-3 text-4xl font-bold text-black">Borrow Books</h1>
          <p className="text-lg text-gray-600">
            Discover and borrow books from our extensive collection
          </p>
        </div>

        {/* Search Bar */}
        <div
          className="animate-fadeInUp mx-auto mb-8 w-full max-w-3xl opacity-0"
          style={{ animationDelay: "0.3s" }}
        >
          {/* <SearchBar pageType="borrow" onSearch={handleSearch} /> */}
        </div>

        {/* Books Grid */}
        {borrowBooks && borrowBooks.length > 0 ? (
          <div className="flex flex-col gap-4">
            {borrowBooks.map((book) => (
              <HorizontalBookCard
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
            <p className="text-gray-600">
              Try adjusting your search criteria to find more books
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowBooksPage;
