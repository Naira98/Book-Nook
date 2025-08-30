import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRecommendations } from "../../hooks/recommendations/useRecommendations";
import Spinner from "../shared/Spinner";
import RecommendationBookCard from "./RecommendBookCard";

export default function RecommendationCarousel() {
  const { recommendations, isPending } = useRecommendations();
  
  return (
    <section className="bg-[#dce9ed] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-10 text-center text-2xl font-bold text-[#0B3460]">
          Recommended For You
        </h2>
        {isPending ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size={200} />
          </div>
        ) : (
          <Swiper
            slidesPerView={2}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              1060: {
                slidesPerView: 2,
              },
            }}
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
        )}
      </div>
    </section>
  );
}
