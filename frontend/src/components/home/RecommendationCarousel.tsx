import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import RecommendationBookCard from "./RecommendBookCard";
import { useRecommendations } from "../../hooks/recommendations/useRecommendations";


export default function RecommendationSlider() {
  const { recommendations } = useRecommendations();
  return (
    <section className="py-12 bg-[#dce9ed]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center text-[#0B3460] mb-10">
          Recommended For You
        </h2>

        <Swiper
          slidesPerView={2}
          spaceBetween={30}
          loop={true}
          modules={[Navigation]}
        >
          {recommendations.map((rec) => (
            <SwiperSlide key={rec.id}>
              <RecommendationBookCard rec={rec} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

