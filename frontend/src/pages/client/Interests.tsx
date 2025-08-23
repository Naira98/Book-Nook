import { motion } from "framer-motion";
import {
  ArrowRight,
  Book,
  Check,
  Film,
  FlaskRound,
  Globe,
  GraduationCap,
  History,
  PenTool,
  Rocket,
  Sparkles,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-[#dfe8ef] px-4 pt-20 pb-12 sm:px-6">
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
        className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl sm:p-10 md:p-12"
      >
        <h1 className="mb-2 text-center text-2xl font-bold text-[#0b3460] sm:text-3xl">
          Select Your Interests
        </h1>
        <p className="mb-8 text-center text-sm text-gray-600 sm:mb-10 sm:text-base">
          Choose topics you’re most interested in to personalize your
          experience.
        </p>

        {/* Interests Grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:mb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 md:gap-8">
          {interestsList.map((item) => {
            const Icon = item.icon;
            const isSelected = selected.includes(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSelect(item.id)}
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 px-3 py-5 text-sm font-medium shadow-md transition-all duration-300 sm:px-4 sm:py-6 sm:text-lg ${
                  isSelected
                    ? "text-primary border-green-300 bg-white"
                    : "hover:border-primary border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {/* Icon */}
                <Icon
                  className={`mb-2 h-6 w-6 sm:mb-3 sm:h-8 sm:w-8 ${item.color}`}
                />
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
                    className="absolute right-2 bottom-2 text-green-500"
                  >
                    <Check size={20} className="sm:h-6 sm:w-6" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleContinue}
            disabled={selected.length === 0}
            className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition sm:w-auto sm:text-lg ${
              selected.length > 0
                ? "bg-primary hover:bg-hover text-white"
                : "cursor-not-allowed bg-gray-400 text-gray-200"
            }`}
          >
            Continue <Rocket size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-200 px-6 py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-300 sm:w-auto sm:text-lg"
          >
            Back <ArrowRight size={20} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SelectInterests;
