import type { FormApi } from "final-form";
import { Field, Form } from "react-final-form";
import { Link } from "react-router-dom";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import Dropzone from "../../components/shared/formInputs/Dropzone";
import SelectInput from "../../components/shared/formInputs/SelectInput";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddBook } from "../../hooks/books/useAddBook";
import { useGetAuthors } from "../../hooks/books/useGetAuthors";
import { useGetCategories } from "../../hooks/books/useGetCategories";
import type { IAddBookData } from "../../types/staff/staffBookTypes";

const AddBookPage = () => {
  const { categories } = useGetCategories();
  const { authors } = useGetAuthors();
  const { addBook, isPending } = useAddBook();

  const onSubmit = (values: IAddBookData, form: FormApi<IAddBookData>) => {
    addBook(values, {
      onSuccess: () => form.reset(),
    });
  };

  const validate = (values: IAddBookData) => {
    const errors: Partial<Record<keyof IAddBookData, string>> = {};

    if (!values.title) errors.title = "Title is required";
    if (!values.description) errors.description = "Description is required";
    if (!values.category_id) errors.category_id = "Category is required";
    if (!values.author_id) errors.author_id = "Author is required";
    if (!values.img_file) errors.img_file = "Cover image is required";
    if (isNaN(parseFloat(values.price)) || Number(values.price) <= 0)
      errors.price = "Price must be a positive number";
    if (!values.publish_year) {
      errors.publish_year = "Publish year is required";
    } else {
      const year = Number(values.publish_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1000 || year > currentYear) {
        errors.publish_year = "Please enter a valid year";
      }
    }
    if (values.purchase_available_stock == null)
      errors.purchase_available_stock = "Purchase stock is required";
    if (Number(values.purchase_available_stock) < 0)
      errors.purchase_available_stock =
        "Purchase stock must be a non-negative number";

    if (values.borrow_available_stock == null)
      errors.borrow_available_stock = "Borrow stock is required";
    if (Number(values.borrow_available_stock) < 0)
      errors.borrow_available_stock =
        "Borrow stock must be a non-negative number";

    return errors;
  };

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
      <GoBackButton />

      <h2 className="text-primary mt-12 text-center text-2xl font-bold md:mt-6">
        Create a New Book
      </h2>
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({
          handleSubmit,
          submitting,
          pristine,
          hasValidationErrors,
        }) => (
          <form onSubmit={handleSubmit}>
            {formData.map((item, index) => {
              if (item.type == "select") {
                return (
                  <Field name={item.name}>
                    {({ input, meta }) => (
                      <div key={index} className="mb-9 flex items-center gap-8">
                        <SelectInput
                          name={item.name}
                          placeholder={item.placeholder}
                          options={item.options}
                          value={input.value}
                          onChange={input.onChange}
                          error={
                            meta.touched && meta.error ? meta.error : undefined
                          }
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
                    )}
                  </Field>
                );
              } else if (item.type == "dropzone") {
                return (
                  <Field name={item.name} key={index}>
                    {({ input }) => (
                      <Dropzone
                        name={item.name}
                        key={index}
                        value={input.value}
                        onChange={input.onChange}
                      />
                    )}
                  </Field>
                );
              } else {
                return (
                  <Field name={item.name} key={index}>
                    {({ input, meta }) => (
                      <TextInput
                        name={item.name}
                        type={item.type}
                        placeholder={item.placeholder}
                        value={input.value}
                        onChange={input.onChange}
                        error={
                          meta.touched && meta.error ? meta.error : undefined
                        }
                      />
                    )}
                  </Field>
                );
              }
            })}
            <div className="mt-12">
              <MainButton
                disabled={submitting || pristine || hasValidationErrors}
                loading={isPending}
              >
                Add Book
              </MainButton>
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default AddBookPage;
