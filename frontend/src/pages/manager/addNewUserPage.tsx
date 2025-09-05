import { Field, Form } from "react-final-form";
import MainButton from "../../components/shared/buttons/MainButton";
import SelectInput from "../../components/shared/formInputs/SelectInput";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddNewStaff } from "../../hooks/manager/useAddNewStaff";
import type { AddNewUserFormValues } from "../../types/auth";

export default function AddNewUser() {
  const { addNewStaff, isPending } = useAddNewStaff();

  const validate = (values: AddNewUserFormValues) => {
    const errors: Partial<AddNewUserFormValues> = {};
    if (!values.first_name) errors.first_name = "First Name is required";
    if (!values.last_name) errors.last_name = "Last Name is required";
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.national_id) errors.national_id = "National ID is required";
    if (!values.phone_number) errors.phone_number = "Phone Number is required";
    if (!values.password) errors.password = "Password is required";
    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!values.role) errors.role = "Role is required";
    return errors;
  };

  const addNewStaffData = [
    {
      name: "first_name",
      type: "text",
      placeholder: "First Name",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "last_name",
      type: "text",
      placeholder: "Last Name",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "email",
      type: "email",
      placeholder: "Email Address",
    },
    {
      name: "national_id",
      type: "text",
      placeholder: "National ID",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "phone_number",
      type: "text",
      placeholder: "Phone Number",
      containerClassName: "!w-full sm:!w-[calc(50%-10px)]",
    },
    {
      name: "password",
      type: "password",
      placeholder: "Password",
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "Confirm Password",
    },
    {
      name: "role",
      type: "select",
      placeholder: "Select Role",
      options: [
        { label: "Employee", value: "EMPLOYEE" },
        { label: "Courier", value: "COURIER" },
        { label: "Manager", value: "MANAGER" },
      ],
      containerClassName: "!w-full",
    },
  ];

  const onSubmit = (values: AddNewUserFormValues) => {
    addNewStaff(values);
  };

  return (
    <div className="p-10">
      <div className="flex flex-1 flex-col overflow-auto">
        <h1 className="text-primary mb-6 text-3xl font-bold">Add New User</h1>
        <div className="flex w-full flex-col p-6 md:w-1/2 lg:p-8">
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
                <div className="flex flex-wrap gap-x-5">
                  {addNewStaffData.map((item) => (
                    <Field name={item.name} key={item.name}>
                      {({ input, meta }) =>
                        item.type === "select" ? (
                          <div
                            className={`mb-9 flex items-center gap-8 ${item.containerClassName}`}
                          >
                            <SelectInput
                              {...input}
                              placeholder={item.placeholder}
                              options={
                                item.options
                                  ? item.options.map((opt) => ({
                                      id: opt.value,
                                      name: opt.label,
                                    }))
                                  : []
                              }
                              error={
                                meta.touched && meta.error
                                  ? meta.error
                                  : undefined
                              }
                              containerClassName="flex-1"
                            />
                          </div>
                        ) : (
                          <TextInput
                            {...input}
                            type={item.type}
                            placeholder={item.placeholder}
                            containerClassName={item.containerClassName}
                            error={
                              meta.touched && meta.error
                                ? meta.error
                                : undefined
                            }
                          />
                        )
                      }
                    </Field>
                  ))}
                </div>

                <div className="mt-6">
                  <MainButton
                    disabled={submitting || pristine || hasValidationErrors}
                    loading={isPending}
                  >
                    Add New Staff Member
                  </MainButton>
                </div>
              </form>
            )}
          />
        </div>
      </div>
    </div>
  );
}
