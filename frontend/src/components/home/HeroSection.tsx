import heroBookImage from "../../assets/hero-book.png";
import MainButton from "../shared/buttons/MainButton";
import heroHexagon from "../../assets/hero-Hexagon.png";
import heroShape from "../../assets/hero-shape.png";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
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
            onClick={() => navigate("/borrow-books")}
            className="!w-[200px]"
          >
            Start now
          </MainButton>
        </div>
        <img
          src={heroBookImage}
          alt="books"
          className="absolute right-0 bottom-0 hidden lg:block"
        />
        <img
          src={heroHexagon}
          alt="Hexagon"
          className="animate-left-and-right absolute top-40 left-1/2 opacity-70"
        />
        <img
          src={heroShape}
          alt="shape"
          className="animate-up-and-down absolute top-20 left-[30%]"
        />
      </div>
    </section>
  );
}
