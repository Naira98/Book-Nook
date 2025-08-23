import { Star } from "lucide-react";

interface Recommendation {
  id: number;
  title: string;
  author: { name: string };
  category: { name: string };
  status: string;
  cover_img: string;
  description: string;
  available_stock: number;
}

const RecommendationBookCard = ({ rec }: { rec: Recommendation }) => {
  return (
    <div className="h-[600 px] w-[800 px] flex flex-row rounded-2xl bg-white p-6 shadow-lg">
      {/* Left Section - Text Content */}
      <div className="flex flex-1 flex-col pr-6">
        {/* Category + Rating */}
        <div className="mb-3 flex items-center justify-between">
          <span className="bg-primary inline-block rounded-md px-3 py-1 text-sm font-medium text-white">
            {rec.category.name}
          </span>
          <div className="flex items-center text-sm text-orange-500">
            {/* Dummy 4-star rating */}
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4 fill-current" />
            <Star className="h-4 w-4" /> {/* empty star */}
            <span className="ml-1 text-gray-600">(459)</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800">
          {rec.title}
        </h3>

        {/* Author */}
        <div className="mb-2 flex items-center">
          <span className="text-sm text-gray-700">{rec.author.name}</span>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-4 text-sm text-gray-600">
          {rec.description}
        </p>

        {/* Stock
        <p className="text-sm text-gray-800 font-semibold mb-4">
          {rec.available_stock > 0
            ? `${rec.available_stock} available for purchase`
            : "Out of stock"}
        </p> */}
      </div>

      {/* Right Section - Cover Image */}
      <div className="flex h-56 w-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
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
