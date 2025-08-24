import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import animationData from "../../assets/json/Searching.json";

interface FullScreenSpinnerProps {
  minDisplayTime?: number; // Minimum display time in milliseconds (default: 3000ms)
  message?: string; // Optional loading message
  className?: string;
}

const FullScreenSpinner = ({
  minDisplayTime = 3000,
  message = "Loading...",
  className = "",
}: FullScreenSpinnerProps) => {
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    // Ensure spinner shows for minimum time
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
      <div className="mb-6 h-32 w-32">
        <Lottie
          loop={true}
          animationData={animationData}
          className="h-full w-full"
        />
      </div>

      {/* Loading Message */}
      {message && (
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenSpinner;
