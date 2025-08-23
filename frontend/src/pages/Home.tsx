import { SwiperSlide } from "swiper/react";
import "../../node_modules/swiper/modules/navigation.css";
import "../../node_modules/swiper/modules/pagination.css";
import "../../node_modules/swiper/swiper.css";
import HeroSection from "../components/home/HeroSection";
import OurServices from "../components/home/OurServices";
import PromoCodeDiscount from "../components/home/PromoCodeDiscount";
import RecommendationCarousel from "../components/home/RecommendationCarousel";
import HomeSlider from "../components/shared/HomeSlider";
import { useGetBorrowBooks } from "../hooks/books/useGetBorrowBooks";
export default function Home() {
  const { borrowBooks } = useGetBorrowBooks();

  // Fetch full book objects for recommended IDs to get cover_img and other fields

  return (
    <>
      <HeroSection />

      <HomeSlider title="Available Borrow Books" to="/borrow-books">
        {borrowBooks?.map((book) => (
          <SwiperSlide>
            <div className="mb-4 aspect-3/4 h-full w-full">
              <img src={book.cover_img} className="w-full" />
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
        // containerClassName="mb-16"
      >
        {borrowBooks?.map((book) => (
          <SwiperSlide>
            <div className="mb-4 aspect-3/4 h-full w-full">
              <img src={book.cover_img} className="w-full" />
            </div>
            <p className="text-sm text-gray-700">{book.author.name}</p>
            <p className="text-primary text-lg">{book.title}</p>
            <p className="text-secondary">
              {book.borrow_fees_per_week} Egp / Week{" "}
            </p>
          </SwiperSlide>
        ))}
      </HomeSlider>

      <RecommendationCarousel />

      <OurServices />
      <PromoCodeDiscount />
    </>
  );
}
