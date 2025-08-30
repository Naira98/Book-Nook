import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import animationData from "../../assets/json/Searching.json";

interface FullScreenSpinnerProps {
  minDisplayTime?: number;
  className?: string;
}

const FullScreenSpinner = ({
  minDisplayTime = 3000,
  className = "",
}: FullScreenSpinnerProps) => {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(false);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime]);

  if (!showSpinner) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 ${className}`}
    >
      {/* Spinner */}
      <div className="mb-6 h-100 w-100">
        <Lottie
          loop={true}
          animationData={animationData}
          className="h-full w-full"
        />
      </div>

    </div>
  );
};

export default FullScreenSpinner;
