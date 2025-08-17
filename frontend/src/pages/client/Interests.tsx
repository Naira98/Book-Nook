import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Book,
  FlaskRound,
  History,
  GraduationCap,
  Sparkles,
  Globe,
  PenTool,
  Film,
  Check,
  ArrowRight,
  Rocket,
} from "lucide-react";

const interestsList = [
  { id: 1, name: "Novels", icon: Book, color: "text-red-500" },
  { id: 2, name: "Fiction", icon: Sparkles, color: "text-purple-500" },
  { id: 3, name: "Stories", icon: PenTool, color: "text-orange-500" },
  { id: 4, name: "Education", icon: GraduationCap, color: "text-blue-500" },
  { id: 5, name: "Science", icon: FlaskRound, color: "text-teal-500" },
  { id: 6, name: "History", icon: History, color: "text-yellow-500" },
  { id: 7, name: "World", icon: Globe, color: "text-indigo-500" },
  { id: 8, name: "Movies", icon: Film, color: "text-rose-500" },
];

const SelectInterests: React.FC = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const navigate = useNavigate();

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    console.log("Selected Interests:", selected);
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen bg-[#dfe8ef] flex flex-col items-center px-4 sm:px-6 pt-20 pb-12">
      {/* Logo */}
      <img
        alt="logo"
        className="absolute top-4 left-4 w-16 sm:w-20 md:w-24 lg:w-28"
        src="/src/assets/dark-bg-logo.svg"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-6 sm:p-10 md:p-12 w-full max-w-4xl relative"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0b3460] text-center mb-2">
          Select Your Interests
        </h1>
        <p className="text-gray-600 text-center mb-8 sm:mb-10 text-sm sm:text-base">
          Choose topics you’re most interested in to personalize your experience.
        </p>

        {/* Interests Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
          {interestsList.map((item) => {
            const Icon = item.icon;
            const isSelected = selected.includes(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSelect(item.id)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 py-5 sm:py-6 px-3 sm:px-4 text-sm sm:text-lg font-medium transition-all duration-300 shadow-md cursor-pointer ${
                  isSelected
                    ? "border-green-300 bg-white text-primary"
                    : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <Icon className={`mb-2 sm:mb-3 w-6 h-6 sm:w-8 sm:h-8 ${item.color}`} />
                <span className="text-center">{item.name}</span>

                {/* Checkmark */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    className="absolute bottom-2 right-2 text-green-500"
                  >
                    <Check size={20} className="sm:w-6 sm:h-6" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleContinue}
            disabled={selected.length === 0}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-full text-base sm:text-lg font-semibold transition ${
              selected.length > 0
                ? "bg-primary text-white hover:bg-hover"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Continue <Rocket size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-full text-base sm:text-lg font-semibold transition bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            Back <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SelectInterests;
