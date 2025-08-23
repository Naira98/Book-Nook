import { Star } from "lucide-react";

interface Recommendation {
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  cover_img: string;
  description: string;
  available_stock: number;
}

const RecommendationBookCard = ({ rec }: { rec: Recommendation }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg h-[600 px] w-[800 px] flex flex-row">
      {/* Left Section - Text Content */}
      <div className="flex-1 flex flex-col pr-6">
        {/* Category + Rating */}
        <div className="flex justify-between items-center mb-3">
          <span className="inline-block rounded-md bg-primary px-3 py-1 text-sm font-medium text-white">
            {rec.category}
          </span>
          <div className="flex items-center text-orange-500 text-sm">
            {/* Dummy 4-star rating */}
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4 fill-current" />
            <Star className="w-4 h-4" /> {/* empty star */}
            <span className="ml-1 text-gray-600">(459)</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {rec.title}
        </h3>

        {/* Author */}
        <div className="flex items-center mb-2">
          <span className="text-gray-700 text-sm">{rec.author}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-4 mb-3">
          {rec.description}
        </p>

        {/* Stock */}
        <p className="text-sm text-gray-800 font-semibold mb-4">
          {rec.available_stock > 0
            ? `${rec.available_stock} available for purchase`
            : "Out of stock"}
        </p>
      </div>

      {/* Right Section - Cover Image */}
      <div className="w-40 h-56 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
        <img
          src={rec.cover_img}
          alt={rec.title}
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
};

export default RecommendationBookCard;
