import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import { Link } from "react-router-dom";
import image from "../../assets/register.svg";
import AuthLayout from "../../components/auth/AuthLayout";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useRegister } from "../../hooks/auth/useRegister";
import type { RegisterFormData } from "../../types/auth";

export default function Register() {
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<RegisterFormData>();

  const { register, isPending } = useRegister(setEmailSent, setResendCountdown);

  useEffect(() => {
    if (emailSent && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailSent, resendCountdown]);

  const onSubmit = (values: RegisterFormData) => {
    setFormValues(values);
    register(values);
  };

  const onResend = () => {
    if (formValues) register(formValues);
  };

  const validate = (values: RegisterFormData) => {
    const errors: Partial<RegisterFormData> = {};

    if (!values.first_name) errors.first_name = "First Name is required";
    if (!values.last_name) errors.last_name = "Last Name is required";
    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Invalid email address";
    }
    if (!values.national_id) {
      errors.national_id = "National ID is required";
    }
    if (!values.phone_number) {
      errors.phone_number = "Phone Number is required";
    }
    if (!values.password) errors.password = "Password is required";
    if (!values.confirmPassword) {
      errors.confirmPassword = "Confirm Password is required";
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col overflow-auto md:flex-row-reverse">
        {!emailSent ? (
          <>
            <div className="hidden w-1/2 items-center justify-center md:flex">
              <img
                src={image}
                className="max-w-[80%] object-contain"
                alt="two persons reading books"
              />
            </div>
            <div className="flex w-full flex-col overflow-auto p-6 md:w-1/2 lg:p-8">
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
                      {RegisterformData.map((item, index) => (
                        <Field name={item.name} key={index}>
                          {({ input, meta }) => (
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
                          )}
                        </Field>
                      ))}
                    </div>

                    <div className="mt-6">
                      <MainButton
                        disabled={submitting || pristine || hasValidationErrors}
                        loading={isPending}
                        label="Register"
                      />
                    </div>
                  </form>
                )}
              />
              <div className="mt-5 text-center">
                <p className="text-primary text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-secondary font-medium transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col items-center justify-center gap-4 overflow-auto p-6 md:w-1/2 lg:p-8">
              <p className="text-center">
                We've sent a verification link to your email address. <br />
                Please check your inbox.
              </p>
              {resendCountdown == 0 ? (
                <MainButton onClick={onResend} label="Re-send email" />
              ) : (
                <p className="text-sm text-gray-500">
                  You can re-send the email in {resendCountdown} seconds.
                </p>
              )}
            </div>
            <div className="hidden w-1/2 items-center justify-center md:flex">
              <img
                src="src/assets/email-sent-activation.svg"
                className="max-w-[60%] object-contain"
                alt="eamil sent"
              />
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

const RegisterformData = [
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
];
