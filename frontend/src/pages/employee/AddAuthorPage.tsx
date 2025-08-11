import type { FormApi } from "final-form";
import { Field, Form } from "react-final-form";
import GoBackButton from "../../components/shared/buttons/GoBackButton";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddAuthor } from "../../hooks/books/useAddAuthor";
import type { ICreateAuthorCategoryData } from "../../types/staff/staffBookTypes";

const AddAuthorPage = () => {
  const { addAuthor, isPending } = useAddAuthor();

  const onSubmit = (
    values: ICreateAuthorCategoryData,
    form: FormApi<ICreateAuthorCategoryData>,
  ) => {
    addAuthor(values, { onSuccess: () => form.reset() });
  };

  const validate = (values: ICreateAuthorCategoryData) => {
    const errors: Partial<Record<keyof ICreateAuthorCategoryData, string>> = {};

    if (!values.name || !values.name.trim()) {
      errors.name = "Author name is required";
    }
    return errors;
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-auto p-4 md:p-12">
      <GoBackButton />

      <h2 className="text-primary mt-16 text-center text-2xl font-bold md:mt-6">
        Add a New Author
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
            <Field name="name" key="authorName">
              {({ input, meta }) => (
                <TextInput
                  name="name"
                  type="text"
                  placeholder="Author Name"
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
                label="Add Author"
              />
            </div>
          </form>
        )}
      />
    </div>
  );
};

export default AddAuthorPage;
