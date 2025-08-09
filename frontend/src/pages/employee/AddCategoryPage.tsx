import clsx from "clsx";
import { useCallback, useState } from "react";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import { useAddCategory } from "../../hooks/books/useAddCategory";

const AddCategoryPage = () => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setCategoryName("");
    setErrors({});
    setTouched(false);
  }, []);

  const { createCategory, isPending: isCreatingPending } =
    useAddCategory(resetForm);

  const validate = (nameValue: string) => {
    const newErrors: { name?: string } = {};
    if (!nameValue.trim()) {
      newErrors.name = "Category name is required";
    }
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
    if (touched) {
      setErrors(validate(e.target.value));
    }
  };

  const handleInputBlur = () => {
    setTouched(true);
    setErrors(validate(categoryName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationErrors = validate(categoryName);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      createCategory({ name: categoryName });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton />

      <h2 className="text-primary mt-16 text-center text-2xl font-bold md:mt-6">
        Add a New Category
      </h2>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-9 w-full">
          <div className="relative">
            <input
              type="text"
              id="categoryName"
              name="categoryName"
              placeholder="Category Name"
              value={categoryName}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={clsx(
                `focus:ring-none w-full border-b border-gray-300 p-2 placeholder-gray-400 transition-colors focus:outline-none`,
                {
                  "border-red-300": errors.name && touched,
                },
              )}
            />
            {errors.name && touched && (
              <p className="absolute top-full left-0 inline-block translate-y-2 px-2 text-xs text-red-500">
                {errors.name}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <MainButton
            disabled={
              Object.keys(errors).length > 0 ||
              isCreatingPending ||
              !categoryName.trim()
            }
            loading={isCreatingPending}
            label="Add Category"
          />
        </div>
      </form>
    </div>
  );
};

export default AddCategoryPage;
