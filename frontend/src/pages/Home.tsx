import { useNavigate } from "react-router-dom";
import heroBookImage from "../assets/hero-book.png";
import MainButton from "../components/shared/buttons/MainButton";
import { Swiper, SwiperSlide } from "swiper/react";
import "../../node_modules/swiper/swiper.css";
import { useGetBorrowBooks } from "../hooks/books/useGetBorrowBooks";
import { useGetPurchaseBooks } from "../hooks/books/useGetPruchaseBooks";
export default function Home() {
  const navigate = useNavigate();
  const { borrowBooks } = useGetBorrowBooks();
  const { purchaseBooks } = useGetPurchaseBooks();
  return (
    <>
      {/* landing section */}
      <section className="mb-[100px] flex h-[calc(100vh-80px)] w-full items-center bg-[url('./assets/hero-book-section.png')]">
        <div className="relative container mx-auto flex h-full items-center justify-between">
          <div className="">
            <h6 className="moon-dance-regular text-secondary text-3xl">
              Explore the books
            </h6>
            <h1 className="text-primary mb-[30px] text-[74px] leading-[90px] font-[700]">
              Expand Your Mind <br />
              Reading a Book
            </h1>
            <MainButton
              label="Start now"
              onClick={() => navigate("/borrow-books")}
              className="!w-[200px]"
            />
          </div>
          <img
            src={heroBookImage}
            alt="books"
            className="absolute right-0 bottom-0 hidden lg:block"
          />
        </div>
      </section>

      <section className="container mx-auto py-8">
        <div className="mb-12 flex w-full items-center justify-between">
          <h2 className="text-[40px] font-[700]">Available Books To Borrow</h2>
          <MainButton
            label="Eplore More"
            className="!w-[200px]"
            onClick={() => navigate("/borrow-books")}
          />
        </div>
        <Swiper
          spaceBetween={50}
          slidesPerView={5}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {borrowBooks?.map((book) => (
            <SwiperSlide>
              <div className="min-h-[350px]">
                <img src={book.cover_img} className="mb-4 w-full" />
              </div>
              <p className="text-sm text-gray-700">{book.author.name}</p>
              <p className="text-primary text-lg">{book.title}</p>
              <p className="text-secondary">
                {book.borrow_fees_per_week} Egp / Week{" "}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="container mx-auto py-8">
        <div className="mb-12 flex w-full items-center justify-between">
          <h2 className="text-[40px] font-[700]">
            Available Books To Purchase
          </h2>
          <MainButton
            label="Eplore More"
            className="!w-[200px]"
            onClick={() => navigate("/purchase-books")}
          />
        </div>
        <Swiper
          spaceBetween={50}
          slidesPerView={5}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          {purchaseBooks?.map((book) => (
            <SwiperSlide>
              <div className="min-h-[350px]">
                <img src={book.cover_img} className="mb-4 w-full" />
              </div>
              <p className="text-sm text-gray-700">{book.author.name}</p>
              <p className="text-primary text-lg">{book.title}</p>
              <p className="text-secondary">{book.price} Egp </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </>
  );
}
