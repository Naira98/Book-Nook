import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GoBackButton = ({ to, label }: { to: string; label: string }) => {
  return (
    <div className="absolute top-0 left-0 p-4">
      <Link to={to} className="btn-cyan flex items-center gap-3">
        <ArrowLeft size={16} className="md:h-6 md:w-6" />
        <span className="hidden md:inline">{label}</span>
      </Link>
    </div>
  );
};

export default GoBackButton;
