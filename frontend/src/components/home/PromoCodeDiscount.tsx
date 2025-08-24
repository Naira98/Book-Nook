import { useNavigate } from "react-router-dom";
import MainButton from "../shared/buttons/MainButton";

export default function PromoCodeDiscount() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto my-24">
      <div className="relative w-full overflow-hidden rounded-lg bg-[url('./assets/hero-banner.jpg')] px-4 py-24 sm:px-8 lg:px-16">
        <div className="relative z-20 w-fit">
          <h2 className="mb-10 w-fit text-4xl font-bold text-white">
            Get 20% discount
            <br />
            with WELCOME20 promocode
          </h2>

          <MainButton
            onClick={() => navigate("/borrow-books")}
            className="!text-primary hover:!bg-hover !w-[200px] !rounded-full bg-white hover:!text-white"
          >
            Start now
          </MainButton>
        </div>
        <div className="absolute top-0 left-0 z-10 h-full w-full bg-linear-[90deg,#012e4a_0.13%,#012e4ae3_11.56%,#012e4ac7_24.08%,#012e4aa1_40.96%,#012e4a73_60.02%,#012e4a00_109.02%]"></div>
      </div>
    </div>
  );
}
