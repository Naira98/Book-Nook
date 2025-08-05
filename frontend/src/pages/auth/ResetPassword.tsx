import { Form } from "react-final-form";
import { useParams } from "react-router-dom";
import image from "../../assets/reset-password.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useResetPassword } from "../../hooks/auth/useResetPassword";
import type { ResetPasswordValues } from "../../types/auth";

const ResetPassword = () => {
  const { resetPassword, isPending } = useResetPassword();
  const { reset_token } = useParams();

  const onSubmit = (values: ResetPasswordValues) => {
    const valuesWithToken = { ...values, reset_token };
    resetPassword(valuesWithToken);
  };

  const validate = (values: ResetPasswordValues) => {
    const errors: Partial<ResetPasswordValues> = {};

    // Update the validation to use the corrected names
    if (!values.new_password) {
      errors.new_password = "Password is required";
    }

    if (!values.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    }

    return errors;
  };

  return (
    <AuthLayout title="Reset Password">
      <div className="flex flex-1 flex-col overflow-auto md:flex-row-reverse">
        <div className="hidden w-1/2 items-center justify-center md:flex">
          <img
            src={image}
            className="max-w-[50%] object-contain"
            alt="reset password image"
          />
        </div>
        <div className="flex w-full flex-col justify-center p-8 md:w-1/2">
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({
              handleSubmit,
              submitting,
              pristine,
              hasValidationErrors,
            }) => (
              <form onSubmit={handleSubmit} className="space-y-6">
                {formData.map((item, index) => (
                  <TextInput
                    key={index}
                    name={item.name}
                    type={item.type}
                    placeholder={item.placeholder}
                  />
                ))}

                <div className="mt-6">
                  <MainButton
                    disabled={submitting || pristine || hasValidationErrors}
                    loading={isPending}
                    label="Reset Password"
                  />
                </div>
              </form>
            )}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;

const formData = [
  {
    name: "new_password",
    type: "password",
    placeholder: "New Password",
  },
  {
    name: "confirm_password",
    type: "password",
    placeholder: "Confirm Password",
  },
];
