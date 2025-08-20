import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate} from "react-router-dom";
import BookCard from "../components/client/BookCard";
import type { Book as BookType } from "../types/client/books";
import { ArrowLeft, ArrowRight, BookOpen, ShoppingCart } from "lucide-react";
import { borrowBooksDummy, purchaseBooksDummy } from "../data/mockData";

const recommendedDummy: BookType[] = [
  purchaseBooksDummy[0],
  borrowBooksDummy[2],
  purchaseBooksDummy[2],
  borrowBooksDummy[1],
  purchaseBooksDummy[3],
  borrowBooksDummy[0],
];

const interestedDummy: BookType[] = [
  borrowBooksDummy[5],
  purchaseBooksDummy[4],
  borrowBooksDummy[3],
  purchaseBooksDummy[5],
  borrowBooksDummy[4],
];

const recentActivitiesDummy = [
  { id: 1, type: "borrow", bookTitle: "The Pragmatic Programmer", date: "منذ دقيقة", author: "David Thomas" },
  { id: 2, type: "purchase", bookTitle: "العادات السبع", date: "منذ 3 دقائق", author: "Stephen Covey" },
  { id: 3, type: "borrow", bookTitle: "Clean Code", date: "منذ 5 دقائق", author: "Robert C. Martin" },
  { id: 4, type: "purchase", bookTitle: "Dune", date: "منذ 10 دقائق", author: "Frank Herbert" },
  { id: 5, type: "borrow", bookTitle: "الخيميائي", date: "منذ 15 دقيقة", author: "Paulo Coelho" },
];

/* --------------------- Slider Component (no external libs) --------------------- */

const HeroSlider: React.FC = () => {
  const slides = [
    {
      id: "s1",
      title: "Welcome to Book Nook",
      subtitle: "Find, borrow or buy the best books.",
      img: "https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg",
      cta: { text: "Explore Borrow", to: "/borrow-books" },
    },
    {
      id: "s2",
      title: "Special Offers",
      subtitle: "Amazing discounts on top books.",
      img: "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg",
      cta: { text: "Explore Purchase", to: "/purchase-books" },
    },
    {
      id: "s3",
      title: "Handpicked Recommendations",
      subtitle: "Curated books for your taste.",
      img: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg",
      cta: { text: "See Recommendations", to: "/#recommended" },
    },
  ];

  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const startAuto = () => {
    stopAuto();
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3500);
  };

  const stopAuto = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const goTo = (i: number) => setIndex(i);

  return (
    <div
      ref={containerRef}
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
      className="w-full relative rounded-xl overflow-hidden shadow-md"
    >
      <div className="relative h-[28rem]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-transform duration-700 ease-out ${
              i === index ? "translate-x-0 opacity-100 z-10" : "translate-x-full opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            <div
              className="w-full h-full bg-cover bg-center flex items-center"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(11,52,96,0.6), rgba(11,52,96,0.15)), url(${s.img})`,
              }}
            >
              <div className="container mx-auto px-6">
                <div className="max-w-2xl text-white py-16">
                  <h2 className="text-4xl font-bold mb-3">{s.title}</h2>
                  <p className="mb-6 text-lg">{s.subtitle}</p>
                  <button
                    onClick={() => navigate(s.cta.to)}
                    className="bg-secondary hover:bg-yellow-500 text-white px-5 py-2 rounded-md font-medium"
                  >
                    {s.cta.text}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* pagination dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-3 h-3 rounded-full ${i === index ? "bg-secondary" : "bg-white/60"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

/* --------------------- Custom Section Title Component --------------------- */
const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-start mb-6">
    <h2 className="text-3xl font-extrabold text-primary mb-2 relative after:absolute after:bottom-0 after:left-0 after:h-1 after:w-16 after:bg-secondary after:rounded-full after:mt-1">
      {title}
    </h2>
  </div>
);

/* --------------------- Reusable Book Section Component --------------------- */
const BookSection: React.FC<{
  title: string;
  items: BookType[];
  sectionId?: string;
  onCardClick?: (book: BookType) => void;
}> = ({ title, items, sectionId, onCardClick }) => {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > pages) setPage(1);
  }, [items.length, pages, page]);

  const start = (page - 1) * pageSize;
  const currentItems = items.slice(start, start + pageSize);

  return (
    <div id={sectionId} className="mb-8">
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
      <div className="flex items-center justify-between mb-8">
        <SectionTitle title={title} />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-md bg-white shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="p-2 rounded-md bg-white shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((book, index) => (
            <div
              key={`${book.id}-${book.title}`}
              onClick={() => onCardClick?.(book)}
              className="animate-fadeInUp opacity-0 cursor-pointer transition-transform duration-200 hover:scale-[1.03]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <BookCard book={book} showActions={true} onBorrow={() => {}} onPurchase={() => {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* --------------------- Recent Activities Section --------------------- */
const RecentActivitiesSection: React.FC = () => {
  const activities = useMemo(() => recentActivitiesDummy, []);

  return (
    <div className="mb-8">
      <SectionTitle title="Recent Activities" />
      <div className="p-6 bg-white rounded-xl shadow-md">
        <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="min-w-[18rem] bg-gray-100 p-4 rounded-lg shadow-sm flex items-center space-x-3 transition-transform duration-200 hover:scale-[1.02]"
            >
              {activity.type === "borrow" ? (
                <BookOpen className="w-6 h-6 text-primary" />
              ) : (
                <ShoppingCart className="w-6 h-6 text-secondary" />
              )}
              <div>
                <p className="font-semibold text-sm text-gray-800">
                  {activity.type === "borrow" ? "Borrowed" : "Purchased"}
                </p>
                <p className="text-xs text-gray-600 font-bold">{activity.bookTitle}</p>
                <p className="text-xs text-gray-500">
                  by <span className="font-medium">{activity.author}</span> - {activity.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


/* --------------------- Home Page --------------------- */
const Home: React.FC = () => {
  const navigate = useNavigate();

  // In real app: fetch from API; here we use dummy data
  const topBorrowing = useMemo(() => borrowBooksDummy, []);
  const topPurchase = useMemo(() => purchaseBooksDummy, []);
  const recommended = useMemo(() => recommendedDummy, []);
  const interested = useMemo(() => interestedDummy, []);

  const handleBookClick = (book: BookType) => {
    try {
      if (book.id) {
        navigate(`/books/${book.id}`);
      } else {
        console.error("Attempted to navigate to a book with no ID.");
      }
    } catch (e) {
      console.error("Navigation failed:", e);
    }
  };

  return (
    <div className="min-h-screen  font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <HeroSlider />
        </div>
        <RecentActivitiesSection />

        {/* Top Borrowing Books */}
        <BookSection title="Top Borrowing Books" items={topBorrowing} onCardClick={handleBookClick} sectionId="top-borrow" />
        <BookSection title="Top Purchase Books" items={topPurchase} onCardClick={handleBookClick} sectionId="top-purchase" />
        <BookSection title="Top Recommended Books" items={recommended} onCardClick={handleBookClick} sectionId="recommended" />
        <BookSection title="Books You May Like" items={interested} onCardClick={handleBookClick} sectionId="interested" />
      </div>
    </div>
  );
};

export default Home;