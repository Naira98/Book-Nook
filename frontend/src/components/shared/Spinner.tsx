import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import animationData from "../../assets/json/Searching.json";

interface SpinnerProps {
  size?: number; // Size in pixels
  className?: string;
  minDisplayTime?: number; // Minimum display time in milliseconds
  fullScreen?: boolean; // Whether to make it full screen
}

const Spinner = ({
  size = 80,
  className = "",
  minDisplayTime = 2000,
  fullScreen = false,
}: SpinnerProps) => {
  const [showSpinner, setShowSpinner] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Show spinner immediately
    setShowSpinner(true);
  }, []);

  // Calculate remaining time to ensure minimum display duration
  const elapsedTime = Date.now() - startTime;
  const shouldHide = elapsedTime >= minDisplayTime;

  if (!showSpinner || !shouldHide) {
    return (
      <div
        className={`flex items-center justify-center ${
          fullScreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : ""
        } ${className}`}
      >
        <div style={{ width: size, height: size }}>
          <Lottie
            loop={true}
            animationData={animationData}
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  // return (
  //   <svg
  //     className={clsx("size-5 animate-spin text-white", className)}
  //     xmlns="http://www.w3.org/2000/svg"
  //     fill="none"
  //     viewBox="0 0 24 24"
  //   >
  //     <circle
  //       className="opacity-25"
  //       cx="12"
  //       cy="12"
  //       r="10"
  //       stroke="currentColor"
  //       strokeWidth="4"
  //     ></circle>
  //     <path
  //       className="opacity-75"
  //       fill="currentColor"
  //       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  //     ></path>
  //   </svg>
  // );
};

export default Spinner;
