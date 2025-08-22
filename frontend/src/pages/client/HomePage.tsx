import { useNavigate } from "react-router-dom";
import { SwiperSlide } from "swiper/react";
import HeroSection from "../../components/home/HeroSection";
import OurServices from "../../components/home/OurServices";
import PromoCodeDiscount from "../../components/home/PromoCodeDiscount";
import HomeSlider from "../../components/shared/HomeSlider";
import { useGetBorrowBooks } from "../../hooks/books/useGetBorrowBooks";
import { useGetPurchaseBooks } from "../../hooks/books/useGetPruchaseBooks";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";

export default function HomePage() {
  const { books: borrowBooks } = useGetBorrowBooks();
  const { books: purchaseBooks } = useGetPurchaseBooks();
  const navigate = useNavigate();
  return (
    <>
      <HeroSection />

      <HomeSlider title="Available Borrow Books" to="/borrow-books">
        {borrowBooks?.map((book) => (
          <SwiperSlide
            onClick={() => {
              navigate(`/book/${book.book_details_id}`);
            }}
          >
            <div className="mb-4 aspect-3/4 h-full w-full">
              <img src={book.cover_img} className="h-full w-full" />
            </div>
            <p className="text-sm text-gray-700">{book.author.name}</p>
            <p className="text-primary text-lg">{book.title}</p>
            <p className="text-secondary">
              {book.borrow_fees_per_week} Egp / Week{" "}
            </p>
          </SwiperSlide>
        ))}
      </HomeSlider>

      <HomeSlider
        title="Available Purchase Books"
        to="/purchase-books"
      >
        {purchaseBooks?.map((book) => (
          <SwiperSlide
            onClick={() => {
              navigate(`/book/${book.book_details_id}`);
            }}
          >
            <div className="mb-4 aspect-3/4 h-full w-full">
              <img src={book.cover_img} className="h-full w-full" />
            </div>
            <p className="text-sm text-gray-700">{book.author.name}</p>
            <p className="text-primary text-lg">{book.title}</p>
            <p className="text-secondary">{book.price} Egp </p>
          </SwiperSlide>
        ))}
      </HomeSlider>
      <OurServices />
      <PromoCodeDiscount />
    </>
  );
}
