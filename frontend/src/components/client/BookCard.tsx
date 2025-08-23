import type { Book } from "../../types/client/books";

interface BookCardProps {
  book: Book;
  onBorrow: () => void;
  onPurchase: () => void;
  canBorrow: boolean;
  canPurchase: boolean;
}

export default function BookCard({
  book,
  onBorrow,
  onPurchase,
  canBorrow,
  canPurchase,
}: BookCardProps) {
  return (
    <div className="border p-4 rounded shadow">
      <img src={book.cover_img} alt={book.title} className="w-full h-48 object-cover mb-2" />
      <h2 className="font-bold text-lg">{book.title}</h2>
      <p className="text-gray-600">{book.author.name}</p>
      <p className="text-gray-500">Published: {book.publish_year}</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onBorrow}
          disabled={!canBorrow}
          className={`px-3 py-1 rounded ${canBorrow ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        >
          {canBorrow ? "Borrow" : "Already Borrowed"}
        </button>
        <button
          onClick={onPurchase}
          disabled={!canPurchase}
          className={`px-3 py-1 rounded ${canPurchase ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        >
          {canPurchase ? "Purchase" : "Purchased"}
        </button>
      </div>
    </div>
  );
}

