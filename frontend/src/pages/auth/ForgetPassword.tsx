import { useEffect, useState } from "react";
import { Form } from "react-final-form";
import AuthLayout from "../../components/auth/AuthLayout";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useForgetPassword } from "../../hooks/auth/useForgetPassword";
import type { EmailFormValues } from "../../types/auth";

const ForgetPassword = () => {
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const { forgetPassword, isPending } = useForgetPassword(
    setEmailSent,
    setResendCountdown,
  );

  useEffect(() => {
    if (emailSent && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [emailSent, resendCountdown]);

  const onSubmit = (values: EmailFormValues) => {
    setEmail(values.email);
    forgetPassword(values);
  };

  const onResend = () => {
    forgetPassword({ email });
  };

  const validate = (values: EmailFormValues) => {
    const errors: Partial<EmailFormValues> = {};

    if (!values.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = "Invalid email address";
    }

    return errors;
  };

  return (
    <AuthLayout title="Forget Password">
      <div className="flex flex-1 flex-col overflow-auto md:flex-row-reverse">
        {!emailSent ? (
          <>
            <div className="hidden w-1/2 items-center justify-center md:flex">
              <img
                src="src/assets/forget-password.svg"
                className="max-w-[80%] object-contain"
                alt="Books"
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
                    <>
                      <TextInput name="email" placeholder="Enter your email" />
                      <div className="mt-12">
                        <MainButton
                          disabled={
                            submitting || pristine || hasValidationErrors
                          }
                          loading={isPending}
                          label="Send emai"
                        />
                      </div>
                    </>
                  </form>
                )}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex w-full flex-col items-center justify-center overflow-auto p-6 md:w-1/2 lg:p-8 gap-4">
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
                src="src/assets/mailbox-forget-password.svg"
                className="max-w-[60%] object-contain"
                alt="Books"
              />
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgetPassword;
