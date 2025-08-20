import clsx from "clsx";
import { CheckSquare, ChevronDown, Square, X } from "lucide-react";
import { useState } from "react";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import { useGetCategories } from "../../hooks/books/useGetCategories";
import Spinner from "../shared/Spinner";

interface FilteringSectionProps {
  selectedCategoryIds: number[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedAuthorIds: number[];
  setSelectedAuthorIds: React.Dispatch<React.SetStateAction<number[]>>;
  isOpen: boolean;
  onClose: () => void;
}

const FilteringSection = ({
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedAuthorIds,
  setSelectedAuthorIds,
  isOpen,
  onClose,
}: FilteringSectionProps) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isAuthorsOpen, setIsAuthorsOpen] = useState(true);
  const { categories, isPending: isPendingCategories } = useGetCategories();
  const { authors, isPending: isPendingAuthors } = useGetAuthors();

  const isLoading = isPendingCategories || isPendingAuthors;

  const toggleSelection = (
    list: number[],
    setter: (value: number[]) => void,
    id: number,
  ) => {
    if (list.includes(id)) {
      setter(list.filter((x) => x !== id));
    } else {
      setter([...list, id]);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <>
      {/* Overlay for small screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          "lg:static lg:translate-x-0 lg:w-[20%] lg:border-r-1 border-accent lg:shadow-none", // Styles for large screens
          { "-translate-x-full": !isOpen }, // Hide on small screens when not open
        )}
      >
        <div className="py-4 px-4">
          {/* Close button for small screens */}
          <div className="mb-4 flex justify-end lg:hidden">
            <button onClick={onClose} className="text-gray-600 cursor-pointer hover:text-gray-900">
              <X className="h-6 w-6" />
            </button>
          </div>

        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filter</h2>

        {/* Categories */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
            className={clsx(
              "mb-2 flex w-full items-center justify-between pr-4 text-left text-sm font-medium text-gray-600",
            )}
          >
            <span>Categories</span>

            <ChevronDown
              className={clsx(
                "h-4 w-4 text-gray-400 transition-all duration-300 ease-in-out",
                { "-rotate-90": isCategoriesOpen },
              )}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isCategoriesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="max-h-96 space-y-2 overflow-auto pr-2">
              {((categories ?? []) as Array<{ id: number; name: string }>).map(
                (category: { id: number; name: string }) => {
                  const isSelected = selectedCategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          selectedCategoryIds,
                          setSelectedCategoryIds,
                          category.id,
                        )
                      }
                      className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {isSelected ? (
                        <CheckSquare className="text-primary h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{category.name}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>

        {/* Authors */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsAuthorsOpen((prev) => !prev)}
            className="mb-2 flex w-full items-center justify-between pr-4 text-left text-sm font-medium text-gray-600"
          >
            <span>Authors</span>
            <ChevronDown
              className={clsx(
                "h-4 w-4 text-gray-400 transition-all duration-300 ease-in-out",
                { "-rotate-90": isAuthorsOpen },
              )}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isAuthorsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="max-h-96 space-y-2 overflow-auto pr-2">
              {((authors ?? []) as Array<{ id: number; name: string }>).map(
                (author: { id: number; name: string }) => {
                  const isSelected = selectedAuthorIds.includes(author.id);
                  return (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() =>
                        toggleSelection(
                          selectedAuthorIds,
                          setSelectedAuthorIds,
                          author.id,
                        )
                      }
                      className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {isSelected ? (
                        <CheckSquare className="text-primary h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{author.name}</span>
                    </button>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};

export default FilteringSection;
