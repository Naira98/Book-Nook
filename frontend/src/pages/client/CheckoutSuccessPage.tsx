import Lottie from "lottie-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import animationData from "../../assets/json/Success.json";
import logo from "../../assets/logo_without_sharshora.svg";

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lottieRef = useRef<any>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const handleAnimationComplete = () => {
    // Animation completed, navigate after a short delay
    setTimeout(() => {
      if (!hasNavigated) {
        setHasNavigated(true);
        navigate("/transactions?tab=history");
      }
    }, 1000);
  };

  return (
    <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
      <img
        src={logo}
        alt="logo"
        className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
      />

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
        {/* Lottie Animation */}
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={true}
            onComplete={handleAnimationComplete}
            className="h-full w-full"
          />
        </div>

        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Payment Successful!
        </h1>

        <p className="mb-8 text-lg text-gray-600">
          Your wallet has been successfully funded
        </p>

        {/* Auto-navigation info */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p>Redirecting to transactions in a few seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
