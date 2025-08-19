import clsx from "clsx";
import { CheckSquare, ChevronDown, Square } from "lucide-react";
import { useState } from "react";
import { useGetCategories } from "../../hooks/books/useGetCategories";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import Spinner from "../shared/Spinner";

interface FilteringSectionProps {
  selectedCategoryIds: number[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedAuthorIds: number[];
  setSelectedAuthorIds: React.Dispatch<React.SetStateAction<number[]>>;
}

const FilteringSection = ({
  selectedCategoryIds,
  setSelectedCategoryIds,
  selectedAuthorIds,
  setSelectedAuthorIds,
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
    <aside className="border-accent sticky top-0 w-[20%] border-r-1">
      <div className="py-4">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filter</h2>

        {/* Categories */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setIsCategoriesOpen((prev) => !prev)}
            className={clsx(
              "mb-2 flex w-full items-center justify-between pr-4 text-left text-sm font-medium text-gray-600",
            )}
            aria-expanded={isCategoriesOpen}
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
                      aria-pressed={isSelected}
                      className="flex w-full items-center gap-2 rounded px-1 py-1 text-left text-sm text-gray-800 hover:bg-gray-50"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
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
            aria-expanded={isAuthorsOpen}
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
                      aria-pressed={isSelected}
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
  );
};

export default FilteringSection;
