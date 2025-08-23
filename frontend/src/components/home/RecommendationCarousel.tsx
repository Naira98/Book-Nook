import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import RecommendationBookCard from "./RecommendBookCard";
import { useRecommendations } from "../../hooks/recommendations/useRecommendations";

export default function RecommendationSlider() {
  const { recommendations } = useRecommendations();
  return (
    <section className="bg-[#dce9ed] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-[#0B3460]">
          Recommended For You
        </h2>

        <Swiper
          slidesPerView={2}
          spaceBetween={30}
          autoplay={{
            delay: 1500,
            disableOnInteraction: false,
          }}
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
}
