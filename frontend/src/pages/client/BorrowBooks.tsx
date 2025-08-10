import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import type { Book } from '../../types/client/books';
import SearchBar from '../../components/client/SearchBar';
import BookCard from '../../components/client/BookCard';
import { borrowBooksDummy } from '../../data/mockData';

const BorrowBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(borrowBooksDummy);
  const [loading, setLoading] = useState(false);
  const [borrowDuration, setBorrowDuration] = useState(7);
  const [customDays, setCustomDays] = useState('');

  const calculateBorrowFees = (basePrice: number, days: number) => {
    const dailyRate = basePrice * 0.05;
    const deposit = basePrice * 0.2;
    const totalFees = dailyRate * days;

    return {
      dailyRate: dailyRate.toFixed(2),
      deposit: deposit.toFixed(2),
      totalFees: totalFees.toFixed(2),
      totalCost: (deposit + totalFees).toFixed(2)
    };
  };

  useEffect(() => {
    setBooks(borrowBooksDummy);
  }, []);

  const handleSearch = (query: string, filters: { category: string, status: string }) => {
    setLoading(true);
    let filteredBooks = [...borrowBooksDummy];
    if (query) {
      const searchQuery = query.toLowerCase();
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery) ||
        book.author.name.toLowerCase().includes(searchQuery) ||
        book.description.toLowerCase().includes(searchQuery)
      );
    }
    if (filters.category) {
      filteredBooks = filteredBooks.filter(book => 
        book.category.name.toLowerCase() === filters.category.toLowerCase()
      );
    }
    if (filters.status === 'borrow') {
      filteredBooks = filteredBooks.filter(book => 
        book.book_details[0].status === 'BORROW'
      );
    }
    setBooks(filteredBooks);
    setLoading(false);
  };

  const handleBorrow = (bookId: number) => {
    // Note: Do not use alert() in the final application, use a custom modal instead.
    alert(`Book with ID ${bookId} has been added to your borrow list for ${borrowDuration} days!`);
    console.log(`Borrowing book ID: ${bookId} for ${borrowDuration} days.`);
  };

  const handleCustomDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 30) {
      setBorrowDuration(val);
      setCustomDays(e.target.value);
    } else {
      setCustomDays(e.target.value);
    }
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
        {/* Header */}
        <div className="mb-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl font-bold text-black mb-3">
            Borrow Books
          </h1>
          <p className="text-gray-600 text-lg">
            Discover and borrow books from our extensive collection
          </p>
        </div>

        {/* Borrow Duration Selector */}
        <div className="mb-6 bg-white rounded-lg p-6 shadow-md animate-fadeInUp opacity-0" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Borrow Duration
          </h3>
          <div className="flex flex-wrap gap-3 items-center">
            {[7, 14, 21, 30].map((days) => (
              <button
                key={days}
                onClick={() => {
                  setBorrowDuration(days);
                  setCustomDays('');
                }}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  borrowDuration === days && customDays === ''
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {days} days
              </button>
            ))}
            <input
              type="number"
              min="1"
              max="30"
              placeholder="Custom days (1-30)"
              value={customDays}
              onChange={handleCustomDaysChange}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary w-48"
            />
          </div>

          {/* Fee Calculation Example */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Fee Structure (Example: EGP 25)
            </h4>
            {(() => {
              const fees = calculateBorrowFees(25, borrowDuration);
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Daily Rate:</span>
                    <p className="font-medium text-black">EGP {fees.dailyRate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Deposit:</span>
                    <p className="font-medium text-black">EGP {fees.deposit}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Borrow Fees:</span>
                    <p className="font-medium text-black">EGP {fees.totalFees}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Cost:</span>
                    <p className="font-medium text-primary">EGP {fees.totalCost}</p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-3xl mx-auto mb-8 animate-fadeInUp opacity-0" style={{ animationDelay: '0.3s' }}>
          <SearchBar pageType="borrow" onSearch={handleSearch} />
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {books.map((book, index) => (
              <div
                key={`${book.id}-${index}`}
                className="animate-fadeInUp opacity-0 w-full flex justify-center transition-transform duration-200 hover:scale-[1.03]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <BookCard
                  book={book}
                  onBorrow={handleBorrow}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 animate-fadeInUp opacity-0" style={{ animationDelay: '0.4s' }}>
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">
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

export default BorrowBooks;