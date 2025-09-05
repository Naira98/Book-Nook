import clsx from "clsx";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation } from "swiper/modules";
import { Swiper } from "swiper/react";
import "../../../node_modules/swiper/modules/navigation.css";
import "../../../node_modules/swiper/modules/pagination.css";
import "../../../node_modules/swiper/swiper.css";
import MainButton from "../shared/buttons/MainButton";

export default function HomeSlider({
  children,
  title,
  to,
  containerClassName = "",
}: {
  children?: ReactNode;
  containerClassName?: string;
  title: string;
  to: string;
}) {
  const navigate = useNavigate();
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <section className={clsx("container mx-auto my-24", containerClassName)}>
      <div className="mb-12 flex w-full items-center justify-between">
        <h2 className="text-primary text-[40px] font-[700]">{title}</h2>
        <MainButton
          className="!text-primary !border-primary hover:!bg-hover flex !w-[200px] items-center justify-center gap-2 !rounded-full bg-white duration-100 hover:!text-white"
          onClick={() => navigate(to)}
        >
          Explore More
          <MoveRight size={20} />
        </MainButton>
      </div>
      <div className="relative w-full">
        <button
          className="bg-accent text-layout absolute top-1/2 left-0 z-10 flex h-12 w-12 translate-x-1/2 -translate-y-full cursor-pointer items-center justify-center rounded-full text-4xl opacity-80 hover:bg-slate-200"
          ref={navigationPrevRef}
        >
          <ChevronLeft />
        </button>

        <button
          className="bg-accent text-layout absolute top-1/2 right-0 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-full cursor-pointer items-center justify-center rounded-full text-4xl opacity-80 hover:bg-slate-200"
          ref={navigationNextRef}
        >
          <ChevronRight />
        </button>
        <Swiper
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          onBeforeInit={(swiper) => {
            if (
              typeof swiper.params.navigation !== "boolean" &&
              swiper.params.navigation
            ) {
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              swiper.params.navigation.nextEl = navigationNextRef.current;
            }
          }}
          spaceBetween={50}
          slidesPerView={5}
          modules={[Navigation, Autoplay]}
          loop={true}
          grabCursor={true}
          breakpoints={{
            0: {
              slidesPerView: 1,
            },
            520: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1000: {
              slidesPerView: 4,
            },
            1200: {
              slidesPerView: 5,
            },
          }}
          className="mySwiper"
        >
          {children}
        </Swiper>
      </div>
    </section>
  );
}
