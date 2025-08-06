import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Clock } from 'lucide-react';
import type { Book } from '../../types/client/books';
import SearchBar from '../../components/client/SearchBar';
import BookCard from '../../components/client/BookCard';

const mockBooks: Book[] = [
  {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  },
   {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  }, {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  }, {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  }, {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  }, {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  }, {
    id: 1,
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    price: 150,
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
    cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
    author: { id: 1, name: "Robert C. Martin" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 5 }]
  },
  {
    id: 2,
    title: "The Pragmatic Programmer",
    price: 180,
    description: "Your journey to mastery in software development",
    cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
    author: { id: 2, name: "David Thomas" },
    category: { id: 1, name: "Programming" },
    book_details: [{ status: 'PURCHASE', available_stock: 3 }]
  },
  {
    id: 3,
    title: "1984",
    price: 200,
    description: "A dystopian social science fiction novel by George Orwell",
    cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
    author: { id: 3, name: "George Orwell" },
    category: { id: 2, name: "Fiction" },
    book_details: [{ status: 'PURCHASE', available_stock: 7 }]
  },
];

const PurchaseBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    setBooks(mockBooks);
  }, []);

  const handleSearch = (query: string, filters: { category: string; status: string }) => {
    setLoading(true);
    let filteredBooks = [...mockBooks];

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
    const allBooks = books.length > 0 ? books : mockBooks;
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 fade-in-up text-left">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Purchase Books</h1>
              <p className="text-gray-600">Discover and buy books from our wide collection</p>
            </div>
            {getCartItemCount() > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-md">
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

        <div className="w-full max-w-4xl mx-auto mb-8">
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
                className="animate-fade-in-up bg-white rounded-xl shadow-md overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both',
                  animationDuration: '0.8s',
                  animationTimingFunction: 'ease-out'
                }}
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
          <div className="text-center py-12 fade-in-up">
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








// import React, { useState, useEffect } from 'react';
// import { ShoppingCart, Plus, Minus, Clock } from 'lucide-react';
// import type { Book } from '../../types/client/books';
// import SearchBar from '../../components/client/SearchBar';
// import BookCard from '../../components/client/BookCard';

// const mockBooks: Book[] = [
//    {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },
//     {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },  {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },  {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },  {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },  {
//     id: 1,
//     title: "Clean Code: A Handbook of Agile Software Craftsmanship",
//     price: 150,
//     description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees",
//     cover_img: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
//     author: { id: 1, name: "Robert C. Martin" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 5 }]
//   },
//   {
//     id: 2,
//     title: "The Pragmatic Programmer",
//     price: 180,
//     description: "Your journey to mastery in software development",
//     cover_img: "https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg",
//     author: { id: 2, name: "David Thomas" },
//     category: { id: 1, name: "Programming" },
//     book_details: [{ status: 'PURCHASE', available_stock: 3 }]
//   },
//   {
//     id: 3,
//     title: "1984",
//     price: 200,
//     description: "A dystopian social science fiction novel by George Orwell",
//     cover_img: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
//     author: { id: 3, name: "George Orwell" },
//     category: { id: 2, name: "Fiction" },
//     book_details: [{ status: 'PURCHASE', available_stock: 7 }]
//   },
// ];

// const PurchaseBooks: React.FC = () => {
//   const [books, setBooks] = useState<Book[]>(mockBooks);
//   const [loading, setLoading] = useState(false);
//   const [cart, setCart] = useState<{ [key: number]: number }>({});

//   useEffect(() => {
//     setBooks(mockBooks);
//   }, []);

//   const handleSearch = (query: string, filters: { category: string; status: string }) => {
//     setLoading(true);

//     let filteredBooks = [...mockBooks];

//     if (query) {
//       const searchQuery = query.toLowerCase();
//       filteredBooks = filteredBooks.filter(book =>
//         book.title.toLowerCase().includes(searchQuery) ||
//         book.author.name.toLowerCase().includes(searchQuery) ||
//         book.description.toLowerCase().includes(searchQuery)
//       );
//     }

//     if (filters.category) {
//       filteredBooks = filteredBooks.filter(
//         book => book.category.name.toLowerCase() === filters.category.toLowerCase()
//       );
//     }

//     if (filters.status === 'purchase') {
//       filteredBooks = filteredBooks.filter(
//         book => book.book_details[0].status === 'PURCHASE'
//       );
//     }

//     setBooks(filteredBooks);
//     setLoading(false);
//   };

//   const addToCart = (bookId: number) => {
//     setCart(prev => ({
//       ...prev,
//       [bookId]: (prev[bookId] || 0) + 1,
//     }));
//   };

//   const removeFromCart = (bookId: number) => {
//     setCart(prev => {
//       const newCart = { ...prev };
//       if (newCart[bookId] > 1) {
//         newCart[bookId] -= 1;
//       } else {
//         delete newCart[bookId];
//       }
//       return newCart;
//     });
//   };

//   const getCartTotal = () => {
//     const allBooks = books.length > 0 ? books : mockBooks;
//     return Object.entries(cart).reduce((total, [bookId, quantity]) => {
//       const book = allBooks.find(b => b.id === parseInt(bookId));
//       return total + (book ? book.price * quantity : 0);
//     }, 0);
//   };

//   const getCartItemCount = () => {
//     return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
//   };

//   return (
//     <div className="min-h-screen bg-[#dfe8ef] font-sans">
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-8 fade-in-up text-left">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-black mb-2">Purchase Books</h1>
//               <p className="text-gray-600">Discover and purchase books from our extensive collection</p>
//             </div>
//             {getCartItemCount() > 0 && (
//               <div className="bg-white rounded-lg p-4 shadow-md">
//                 <div className="flex items-center space-x-3">
//                   <div className="relative">
//                     <ShoppingCart className="w-6 h-6 text-primary" />
//                     <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                       {getCartItemCount()}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-sm text-gray-600">Cart Total</p>
//                     <p className="text-lg font-bold text-primary">{getCartTotal().toFixed(2)} EGP</p>
//                   </div>
//                   <button className="bg-primary hover:bg-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
//                     Checkout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="w-full max-w-4xl mx-auto mb-8">
//           <SearchBar pageType="purchase" onSearch={handleSearch} />
//         </div>

//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//           </div>
//         ) : books.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mx-auto justify-center">
//             {books.map((book, index) => (
//               <div
//                 key={`${book.id}-${index}`}
//                 className="animate-fade-in-up"
//                 style={{
//                   animationDelay: `${index * 100}ms`,
//                   animationFillMode: 'both',
//                   animationDuration: '0.8s',
//                   animationTimingFunction: 'ease-out',
//                   maxWidth: '280px'
//                 }}
//               >
//                 <div className="relative w-full">
//                   <BookCard book={book} />
//                   <div className="absolute bottom-4 left-4 right-4">
//                     <div className="bg-white p-3 rounded-lg shadow-lg">
//                       <div className="flex items-center justify-between mb-3">
//                         <span className="text-lg font-bold text-primary">
//                           {book.price.toFixed(2)} EGP
//                         </span>
//                         <span className="text-sm text-gray-600">
//                           Stock: {book.book_details[0]?.available_stock || 0}
//                         </span>
//                       </div>

//                       {cart[book.id] ? (
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={() => removeFromCart(book.id)}
//                               className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
//                             >
//                               <Minus className="w-4 h-4" />
//                             </button>
//                             <span className="text-lg font-medium text-black min-w-[2rem] text-center">
//                               {cart[book.id]}
//                             </span>
//                             <button
//                               onClick={() => addToCart(book.id)}
//                               className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
//                             >
//                               <Plus className="w-4 h-4" />
//                             </button>
//                           </div>
//                           <span className="text-sm font-medium text-primary">
//                             {(book.price * cart[book.id]).toFixed(2)} EGP
//                           </span>
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => addToCart(book.id)}
//                           className="w-full bg-secondary hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
//                         >
//                           <ShoppingCart className="w-4 h-4" />
//                           <span>Add to Cart</span>
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-12 fade-in-up">
//             <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-medium text-black mb-2">No books found</h3>
//             <p className="text-gray-600">Try adjusting your search criteria to find more books</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PurchaseBooks;
