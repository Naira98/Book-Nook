import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import Dropzone from "../../components/shared/formInputs/Dropzone";
import SelectInput from "../../components/shared/formInputs/SelectInput";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddBook } from "../../hooks/books/useAddBook";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import { useGetCategories } from "../../hooks/books/useGetCategories";

const initialFormState = {
  title: "",
  price: "",
  description: "",
  publish_year: "",
  img_file: null as File | null,
  category_id: "",
  author_id: "",
  purchase_available_stock: "",
  borrow_available_stock: "",
};

const AddBookPage = () => {
  const { categories, isPending: isCategoriesPending } = useGetCategories();
  const { authors, isPending: isAuthorsPending } = useGetAuthors();

  const [formValues, setFormValues] = useState(initialFormState);
  const [errors, setErrors] = useState<{
    [key in keyof typeof initialFormState]?: string;
  }>({});

  const { createBook, isPending: isCreatingPending } = useAddBook();

  const resetForm = useCallback(() => {
    setFormValues(initialFormState);
    setErrors({});
  }, []);

  const isValidPositiveNumber = (
    value: string | number | null | undefined,
  ): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  };

  const isNonNegativeNumber = (
    value: string | number | null | undefined,
  ): boolean => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
  };

  const isFormValid = useCallback(() => {
    const {
      title,
      price,
      description,
      publish_year,
      img_file,
      category_id,
      author_id,
      purchase_available_stock,
      borrow_available_stock,
    } = formValues;

    const areRequiredFieldsFilled =
      title &&
      description &&
      publish_year &&
      category_id &&
      author_id &&
      img_file;

    const areNumbersValid =
      isValidPositiveNumber(price) &&
      (isValidPositiveNumber(purchase_available_stock) ||
        isValidPositiveNumber(borrow_available_stock)) &&
      isNonNegativeNumber(purchase_available_stock) &&
      isNonNegativeNumber(borrow_available_stock);

    const isPublishYearValid =
      publish_year && Number(publish_year) <= new Date().getFullYear();

    return areRequiredFieldsFilled && areNumbersValid && isPublishYearValid;
  }, [formValues]);

  const validate = useCallback((values: typeof initialFormState) => {
    const newErrors: typeof errors = {};

    if (!values.title) newErrors.title = "Title is required";
    if (!values.description) newErrors.description = "Description is required";
    if (!values.category_id) newErrors.category_id = "Category is required";
    if (!values.author_id) newErrors.author_id = "Author is required";
    if (!values.img_file) newErrors.img_file = "Cover image is required";

    // Validate numbers with helper functions
    if (!isValidPositiveNumber(values.price)) {
      newErrors.price = "Price must be a positive number";
    }

    if (!values.publish_year) {
      newErrors.publish_year = "Publish year is required";
    } else {
      const year = Number(values.publish_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        newErrors.publish_year = "Please enter a valid year";
      }
    }

    const purchaseStock = Number(values.purchase_available_stock);
    const borrowStock = Number(values.borrow_available_stock);

    if (
      (!values.purchase_available_stock && !values.borrow_available_stock) ||
      ((isNaN(purchaseStock) || purchaseStock <= 0) &&
        (isNaN(borrowStock) || borrowStock <= 0))
    ) {
      newErrors.purchase_available_stock =
        "At least one of the stock fields must be greater than 0";
      newErrors.borrow_available_stock =
        "At least one of the stock fields must be greater than 0";
    }

    if (
      values.purchase_available_stock &&
      (isNaN(purchaseStock) || purchaseStock < 0)
    ) {
      newErrors.purchase_available_stock =
        "Purchase stock must be a non-negative number";
    }

    if (
      values.borrow_available_stock &&
      (isNaN(borrowStock) || borrowStock < 0)
    ) {
      newErrors.borrow_available_stock =
        "Borrow stock must be a non-negative number";
    }

    return newErrors;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const bookData = {
        ...formValues,
        price: Number(formValues.price),
        category_id: Number(formValues.category_id),
        author_id: Number(formValues.author_id),
        publish_year: Number(formValues.publish_year),
        purchase_available_stock: formValues.purchase_available_stock
          ? Number(formValues.purchase_available_stock)
          : undefined,
        borrow_available_stock: formValues.borrow_available_stock
          ? Number(formValues.borrow_available_stock)
          : undefined,
        img_file: formValues.img_file || undefined,
      };

      createBook(bookData, {
        onSuccess: () => {
          resetForm();
        },
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    setErrors({});
  };

  const handleFileChange = (file: File) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      img_file: file,
    }));
    setErrors({});
  };

  const isFormPending = isCategoriesPending || isAuthorsPending;
  const hasValidationErrors = Object.keys(errors).length > 0;

  const formData = [
    { name: "title", type: "text", placeholder: "Book Title" },
    { name: "price", type: "text", placeholder: "Price" },
    { name: "description", type: "text", placeholder: "Description" },
    { name: "publish_year", type: "number", placeholder: "Publish Year" },
    { name: "img_file", type: "dropzone", placeholder: "Cover Image" },
    {
      name: "category_id",
      type: "select",
      placeholder: "Select Category",
      options: categories || [],
      link: "/staff/books/create-category",
      linkText: "add new category",
    },
    {
      name: "author_id",
      type: "select",
      placeholder: "Select Author",
      options: authors || [],
      link: "/staff/books/create-author",
      linkText: "add new author",
    },
    {
      name: "purchase_available_stock",
      type: "number",
      placeholder: "Purchase Stock",
    },
    {
      name: "borrow_available_stock",
      type: "number",
      placeholder: "Borrow Stock",
    },
  ];

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton to="/staff/books" label="Return to Books Table" />

      <h2 className="text-primary mt-12 text-center text-2xl font-bold md:mt-6">
        Create a New Book
      </h2>
      <form onSubmit={handleSubmit} className="mt-8">
        {isFormPending ? (
          <p>Loading categories and authors...</p>
        ) : (
          formData.map((item, index) => {
            switch (item.type) {
              case "select":
                return (
                  <div key={index} className="mb-9 flex items-center gap-8">
                    <SelectInput
                      name={item.name}
                      placeholder={item.placeholder}
                      options={item.options}
                      containerClassName="flex-1"
                      value={
                        formValues[item.name as keyof typeof formValues] as
                          | string
                          | number
                      }
                      onChange={handleChange}
                      error={errors[item.name as keyof typeof errors]}
                    />
                    {item.link && (
                      <Link
                        to={item.link}
                        className="text-primary hover:text-hover flex w-36 items-center gap-2 text-center text-sm font-semibold whitespace-nowrap transition-colors focus:outline-none"
                      >
                        + {item.linkText}
                      </Link>
                    )}
                  </div>
                );
              case "dropzone":
                return (
                  <Dropzone
                    name={item.name}
                    key={index}
                    onChange={handleFileChange}
                    value={formValues.img_file}
                  />
                );
              case "text":
              case "number":
                return (
                  <TextInput
                    key={index}
                    name={item.name}
                    type={item.type}
                    placeholder={item.placeholder}
                    value={
                      formValues[item.name as keyof typeof formValues] as
                        | string
                        | number
                        | null
                        | undefined
                    }
                    onChange={handleChange}
                    error={errors[item.name as keyof typeof errors]}
                  />
                );
              default:
                return null;
            }
          })
        )}
        <div className="mt-6">
          <MainButton
            disabled={
              !isFormValid() || hasValidationErrors || isCreatingPending
            }
            loading={isCreatingPending}
            label="Create Book"
          />
        </div>
      </form>
    </div>
  );
};

export default AddBookPage;
