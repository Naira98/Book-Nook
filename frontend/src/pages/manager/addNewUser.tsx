import { Field, Form } from "react-final-form";
import AuthLayout from "../../components/auth/AuthLayout";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useAddNewStaff } from "../../hooks/manager/useAddNewStaff";
import type { AddNewUserFormValues } from "../../types/auth";

export default function AddNewUser() {
  const {addNewStaff,isPending}=useAddNewStaff();


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
        { label: "Employee", value: "employee" },
        { label: "Courier", value: "courier" },
      ],
      containerClassName: "!w-full",
    },
  ];

  const onSubmit = (values: AddNewUserFormValues) => {
    addNewStaff(values);
  };

  return (
    <AuthLayout>
   
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex w-full flex-col p-6 md:w-1/2 lg:p-8">
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, submitting, pristine }) => (
              <form onSubmit={handleSubmit} className="space-y-4">
                {addNewStaffData.map((field) => (
                  <Field key={field.name} name={field.name}>
                    {({ input, meta }) => (
                      <div className={field.containerClassName}>
                        {field.type === "select" ? (
                          <select
                            {...input}
                            className="w-full border p-2 rounded"
                          >
                            <option value="">{field.placeholder}</option>
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <TextInput
                            {...input}
                            type={field.type}
                            placeholder={field.placeholder}
                            error={meta.touched && meta.error}
                          />
                        )}
                      
                      </div>
                    )}
                  </Field>
                ))}

                <MainButton
                  // type="submit"
                  disabled={submitting || pristine || isPending}
                  className="w-full"
                  loading={isPending}
                >Add User</MainButton>
              </form>
            )}
          />
        </div>
      </div>
    </AuthLayout>
  );
}


