// src/pages/client/Home.tsx
import { useNavigate } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import HeroSection from "../../components/home/HeroSection";
import OurServices from "../../components/home/OurServices";
import PromoCodeDiscount from "../../components/home/PromoCodeDiscount";
import HomeSlider from "../../components/shared/HomeSlider";
import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
import { useGetPurchaseBooks } from "../../hooks/books/useGetPruchaseBooks";
import { useGetBooksByInterests } from "../../hooks/books/useGetBooksByInterests";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";

export default function HomePage() {
  const { books: borrowBooks } = useGetBorrowBooks();
  const { books: purchaseBooks } = useGetPurchaseBooks();
  const { books: interestBooks } = useGetBooksByInterests();
  const navigate = useNavigate();

  return (
    <>
      <HeroSection />

      {interestBooks.length > 0 && (
        <HomeSlider title="📚 Recommended for You" to="/purchase-books">
          {interestBooks.map((book) => (
            <SwiperSlide
              key={book.book_details_id}
              onClick={() => navigate(`/book/${book.book_details_id}`)}
            >
              <div className="mb-4 aspect-3/4 h-full w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <img
                  src={book.cover_img}
                  alt={book.title}
                  className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{book.author.name}</p>
              <p className="text-indigo-600 font-semibold text-lg mt-1">
                {book.title}
              </p>
              <p className="text-green-600 font-medium mt-1">
                {book.price} Egp
              </p>
            </SwiperSlide>
          ))}
        </HomeSlider>
      )}

      <HomeSlider title="📖 Borrowable Books" to="/borrow-books">
        {borrowBooks?.map((book) => (
          <SwiperSlide
            key={book.book_details_id}
            onClick={() => navigate(`/book/${book.book_details_id}`)}
          >
            <div className="mb-4 aspect-3/4 h-full w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <img
                src={book.cover_img}
                alt={book.title}
                className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{book.author.name}</p>
            <p className="text-indigo-600 font-semibold text-lg mt-1">
              {book.title}
            </p>
            <p className="text-yellow-600 font-medium mt-1">
              {book.borrow_fees_per_week} Egp / Week
            </p>
          </SwiperSlide>
        ))}
      </HomeSlider>

      <HomeSlider title="🛒 Purchase Books" to="/purchase-books">
        {purchaseBooks?.map((book) => (
          <SwiperSlide
            key={book.book_details_id}
            onClick={() => navigate(`/book/${book.book_details_id}`)}
          >
            <div className="mb-4 aspect-3/4 h-full w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <img
                src={book.cover_img}
                alt={book.title}
                className="h-full w-full object-cover transform hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{book.author.name}</p>
            <p className="text-indigo-600 font-semibold text-lg mt-1">
              {book.title}
            </p>
            <p className="text-green-600 font-medium mt-1">{book.price} Egp</p>
          </SwiperSlide>
        ))}
      </HomeSlider>

      <OurServices />
      <PromoCodeDiscount />
    </>
  );
}





















// // src/pages/client/Home.tsx
// import { useNavigate } from "react-router-dom";
// import { SwiperSlide } from "swiper/react";
// import HeroSection from "../../components/home/HeroSection";
// import OurServices from "../../components/home/OurServices";
// import PromoCodeDiscount from "../../components/home/PromoCodeDiscount";
// import HomeSlider from "../../components/shared/HomeSlider";
// import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
// import { useGetPurchaseBooks } from "../../hooks/books/useGetPruchaseBooks";
// import { useGetBooksByInterests } from "../../hooks/books/useGetBooksByInterests";
// import "../../../node_modules/swiper/modules/navigation.css";
// import "../../../node_modules/swiper/modules/pagination.css";
// import "../../../node_modules/swiper/swiper.css";

// export default function HomePage() {
//   const { books: borrowBooks } = useGetBorrowBooks();
//   const { books: purchaseBooks } = useGetPurchaseBooks();
//   const { books: interestBooks } = useGetBooksByInterests();
//   const navigate = useNavigate();

//   return (
//     <>
//       <HeroSection />

//       {interestBooks.length > 0 && (
//         <HomeSlider title="Books Based on Your Interests" to="/purchase-books">
//           {interestBooks.map((book) => (
//             <SwiperSlide
//               key={book.book_details_id}
//               onClick={() => navigate(`/book/${book.book_details_id}`)}
//             >
//               <div className="mb-4 aspect-3/4 h-full w-full">
//                 <img src={book.cover_img} className="h-full w-full" />
//               </div>
//               <p className="text-sm text-gray-700">{book.author.name}</p>
//               <p className="text-primary text-lg">{book.title}</p>
//               <p className="text-secondary">{book.price} Egp </p>
//             </SwiperSlide>
//           ))}
//         </HomeSlider>
//       )}

//       <HomeSlider title="Available Borrow Books" to="/borrow-books">
//         {borrowBooks?.map((book) => (
//           <SwiperSlide
//             key={book.book_details_id}
//             onClick={() => navigate(`/book/${book.book_details_id}`)}
//           >
//             <div className="mb-4 aspect-3/4 h-full w-full">
//               <img src={book.cover_img} className="h-full w-full" />
//             </div>
//             <p className="text-sm text-gray-700">{book.author.name}</p>
//             <p className="text-primary text-lg">{book.title}</p>
//             <p className="text-secondary">
//               {book.borrow_fees_per_week} Egp / Week
//             </p>
//           </SwiperSlide>
//         ))}
//       </HomeSlider>

//       <HomeSlider title="Available Purchase Books" to="/purchase-books">
//         {purchaseBooks?.map((book) => (
//           <SwiperSlide
//             key={book.book_details_id}
//             onClick={() => navigate(`/book/${book.book_details_id}`)}
//           >
//             <div className="mb-4 aspect-3/4 h-full w-full">
//               <img src={book.cover_img} className="h-full w-full" />
//             </div>
//             <p className="text-sm text-gray-700">{book.author.name}</p>
//             <p className="text-primary text-lg">{book.title}</p>
//             <p className="text-secondary">{book.price} Egp </p>
//           </SwiperSlide>
//         ))}
//       </HomeSlider>

//       <OurServices />
//       <PromoCodeDiscount />
//     </>
//   );
// }
