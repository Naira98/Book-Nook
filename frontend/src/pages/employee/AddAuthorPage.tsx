import clsx from "clsx";
import { useCallback, useState } from "react";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import { useAddAuthor } from "../../hooks/books/useAddAuthor";

const AddAuthorPage = () => {
  const [authorName, setAuthorName] = useState<string>("");
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [touched, setTouched] = useState<boolean>(false);

  const resetForm = useCallback(() => {
    setAuthorName("");
    setErrors({});
    setTouched(false);
  }, []);

  const { createAuthor, isPending: isCreatingPending } =
    useAddAuthor(resetForm);

  const validate = (nameValue: string) => {
    const newErrors: { name?: string } = {};
    if (!nameValue.trim()) {
      newErrors.name = "Author's name is required";
    }
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthorName(e.target.value);
    if (touched) {
      setErrors(validate(e.target.value));
    }
  };

  const handleInputBlur = () => {
    setTouched(true);
    setErrors(validate(authorName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const validationErrors = validate(authorName);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      createAuthor({ name: authorName });
    }
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton to="/staff/books/create-book" label="Return to add book" />

      <h2 className="text-primary mt-16 text-center text-2xl font-bold md:mt-6">
        Add a New Author
      </h2>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="mb-9 w-full">
          <div className="relative">
            <input
              type="text"
              id="authorName"
              name="authorName"
              placeholder="Author's Name"
              value={authorName}
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
              !authorName.trim()
            }
            loading={isCreatingPending}
            label="Add Author"
          />
        </div>
      </form>
    </div>
  );
};

export default AddAuthorPage;
