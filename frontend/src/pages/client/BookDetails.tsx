import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, ShoppingCart, ArrowLeft } from "lucide-react";
import BookCard from "../../components/client/BookCard";
import type { Book as BookType } from "../../types/client/books";
import { borrowBooksDummy, purchaseBooksDummy } from "../../data/mockData";

// Combined dummy data for all books
const allBooksDummy = [...borrowBooksDummy, ...purchaseBooksDummy];

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<typeof allBooksDummy[0] | null>(null);

  useEffect(() => {
    setBook(null); // Reset book immediately on id change
    if (id) {
      const foundBook = allBooksDummy.find((b) => b.id === Number(id));
      setBook(foundBook || null);
    } else {
      setBook(null);
    }
  }, [id]);

  const relatedBooks = useMemo(() => {
    if (!book) return [];

    const currentBookStatus = book.book_details?.[0]?.status;

    // Filter books by same category AND same status (BORROW or PURCHASE), exclude current book
    const sameCategoryAndStatus = allBooksDummy.filter(
      (b) =>
        b.category?.name === book.category?.name &&
        b.id !== book.id &&
        b.book_details?.[0]?.status === currentBookStatus
    );

    // Limit to max 2 related books
    if (sameCategoryAndStatus.length > 0) {
      return sameCategoryAndStatus.slice(0, 2);
    }

    // Fallback: get up to 2 books from same category regardless of status
    return allBooksDummy
      .filter((b) => b.category?.name === book.category?.name && b.id !== book.id)
      .slice(0, 2);
  }, [book]);

  const handleRelatedBookClick = (relatedBook: BookType) => {
    // Navigate to clicked book details page
    navigate(`/books/${relatedBook.id}`);
  };

  if (!id) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#dfe8ef]">
        <h1 className="text-2xl font-bold text-primary mb-4">Invalid Book</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-800"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#dfe8ef]">
        <h1 className="text-3xl font-bold text-primary mb-4">Book Not Found</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-blue-800"
        >
          Go Home
        </button>
      </div>
    );
  }

  const {
    title,
    author,
    category,
    description,
    price,
    cover_img,
    book_details,
  } = book;

  const status = book_details?.[0]?.status;

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-[#dfe8ef] p-6 md:p-8 overflow-hidden">
      {/* Book Details Section */}
      <div className="flex-grow md:pr-6 mb-6 md:mb-0 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-2 mb-6 text-primary hover:text-blue-800 transition-colors">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          <div className="w-full md:w-1/3 flex justify-center flex-shrink-0">
            {cover_img ? (
              <img
                src={cover_img}
                alt={title}
                className="w-full max-w-[14rem] rounded-lg shadow-xl aspect-[2/3] object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-full max-w-[14rem] rounded-lg shadow-xl aspect-[2/3] bg-gray-200 flex items-center justify-center text-gray-400 text-base">
                No Image
              </div>
            )}
          </div>

          <div className="flex-grow">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-primary mb-2 leading-tight">{title}</h1>
            <p className="text-base text-gray-700 mb-2">
              by <span className="font-semibold">{author?.name}</span>
            </p>
            <p className="text-xs text-gray-500 mb-6 border-b pb-4">Category: {category?.name}</p>

            <h2 className="text-lg font-bold text-primary mb-2">Description</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{description}</p>

            <p className="text-xl font-extrabold text-secondary mb-6">
              Price: {price} EGP
            </p>

            {status === "BORROW" ? (
              <button className="flex items-center justify-center gap-2 bg-primary text-white py-2 px-5 rounded-full font-semibold hover:bg-blue-800 transition shadow-md text-sm">
                <BookOpen className="w-4 h-4" /> Borrow
              </button>
            ) : (
              <button className="flex items-center justify-center gap-2 bg-secondary text-white py-2 px-5 rounded-full font-semibold hover:bg-yellow-500 transition shadow-md text-sm">
                <ShoppingCart className="w-4 h-4" /> Purchase
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      <div className="w-full md:w-1/4 flex-shrink-0 bg-white rounded-xl shadow-lg p-6 overflow-y-auto scrollbar-hide">
        <h2 className="text-lg font-bold text-primary mb-4 pb-2 border-b">
          Related Books
        </h2>
        <div className="flex flex-col gap-4">
          {relatedBooks.length > 0 ? (
            relatedBooks.map((relatedBook) => (
              <div
                key={relatedBook.id}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => handleRelatedBookClick(relatedBook)}
              >
                <BookCard book={relatedBook} showActions={false} onBorrow={() => {}} onPurchase={() => {}} />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No related books found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;