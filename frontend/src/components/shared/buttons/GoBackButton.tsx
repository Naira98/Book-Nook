import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoBackButton = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 p-4">
      <button
        onClick={() => navigate(-1)}
        className="btn-cyan flex items-center gap-3"
      >
        <ArrowLeft size={16} className="md:h-6 md:w-6" />
        <span className="hidden md:inline">Go Back</span>
      </button>
    </div>
  );
};

export default GoBackButton;
