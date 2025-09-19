import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";
import BestBooks from "../../components/home/BestBooks";
import HeroSection from "../../components/home/HeroSection";
import OurServices from "../../components/home/OurServices";
import PromoCodeDiscount from "../../components/home/PromoCodeDiscount";
import RecommendationCarousel from "../../components/home/RecommendationCarousel";
import Footer from "../../components/shared/Footer";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";

export default function HomePage() {
  const { isPending: isCartPending } = useGetCartItems();

  if (isCartPending) {
    return <FullScreenSpinner />;
  }

  return (
    <>
      <HeroSection />
      <BestBooks />
      <RecommendationCarousel />
      <OurServices />
      <PromoCodeDiscount />
      <Footer />
    </>
  );
}
