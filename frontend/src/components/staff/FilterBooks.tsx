import type { AvailabilityOption } from "../../types/BookTable";
import { FilterAvailability } from "../../types/BookTable";

interface filterBooksProps {
  purchaseOptions: AvailabilityOption[];
  borrowOptions: AvailabilityOption[];
  handleAvailabilityChange: (value: FilterAvailability) => void;
  filterAvailability: FilterAvailability;
}

const FilterBooks = ({
  purchaseOptions,
  borrowOptions,
  handleAvailabilityChange,
  filterAvailability,
}: filterBooksProps) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-medium text-gray-500">Availability</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleAvailabilityChange(FilterAvailability.All)}
                className={`btn-filter ${
                  filterAvailability === FilterAvailability.All
                    ? "btn-filter-active"
                    : "btn-filter-inactive"
                }`}
              >
                All Books
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-medium text-gray-500">Purchase</h4>
            <div className="flex gap-2">
              {purchaseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAvailabilityChange(option.value)}
                  className={`btn-filter ${
                    filterAvailability === option.value
                      ? "btn-filter-active"
                      : "btn-filter-inactive"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-medium text-gray-500">Borrow</h4>
            <div className="flex gap-2">
              {borrowOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAvailabilityChange(option.value)}
                  className={`btn-filter ${
                    filterAvailability === option.value
                      ? "btn-filter-active"
                      : "btn-filter-inactive"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBooks;
