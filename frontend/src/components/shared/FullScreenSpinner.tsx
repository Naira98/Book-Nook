import Lottie from "lottie-react";
import animationData from "../../assets/json/Searching.json";

interface FullScreenSpinnerProps {
  className?: string;
}

const FullScreenSpinner = ({ className = "" }: FullScreenSpinnerProps) => {
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
