import type { FormApi } from "final-form";
import { Field, Form } from "react-final-form";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddCategory } from "../../hooks/books/useAddCategory";
import type { ICreateAuthorCategoryData } from "../../types/staff/staffBookTypes";

const AddCategoryPage = () => {
  const { addCategory, isPending } = useAddCategory();

  const onSubmit = (
    values: ICreateAuthorCategoryData,
    form: FormApi<ICreateAuthorCategoryData>,
  ) => {
    addCategory(values, {
      onSuccess: () => form.reset(),
    });
  };

  const validate = (values: ICreateAuthorCategoryData) => {
    const errors: Partial<Record<keyof ICreateAuthorCategoryData, string>> = {};

    if (!values.name || !values.name.trim()) {
      errors.name = "Category name is required";
    }
    return errors;
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton />

      <h2 className="text-primary mt-16 text-center text-2xl font-bold md:mt-6">
        Add a New Category
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
            <Field name="name" key="categoryName">
              {({ input, meta }) => (
                <TextInput
                  name="name"
                  type="text"
                  placeholder="Category Name"
                  value={input.value}
                  onChange={input.onChange}
                  error={meta.touched && meta.error ? meta.error : undefined}
                />
              )}
            </Field>
            <div className="mt-6 flex flex-col gap-4">
              <MainButton
                disabled={submitting || pristine || hasValidationErrors}
                loading={isPending}
                label="Add Category"
              />
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default AddCategoryPage;
