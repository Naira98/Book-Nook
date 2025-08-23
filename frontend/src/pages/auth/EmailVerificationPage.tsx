import { CheckCircle, Mail, RotateCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useEmailVerification } from "../../hooks/auth/useEmailVerification";

const EmailVerification = () => {
  const [hasVerified, setHasVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { emailVerification, isPending } = useEmailVerification();

  useEffect(() => {
    // Extract token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setError("No verification token found in URL");
      return;
    }

    // Only verify once
    if (!hasVerified) {
      setHasVerified(true);

      // Call the verification mutation with error handling
      emailVerification(
        { token },
        {
          onError: () => {
            setError("Invalid or expired verification token");
          },
        },
      );
    }
  }, [emailVerification, hasVerified]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f1f5f9] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-[#012e4a] p-3">
            <Mail className="h-10 w-10 text-white" />
          </div>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#012e4a]">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center justify-center">
            {isPending ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center">
                  <RotateCw className="h-12 w-12 animate-spin text-[#012e4a]" />
                </div>
                <p className="text-[#4f536c]">
                  Verifying your email address...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center">
                <XCircle className="mb-4 h-16 w-16 text-[#fb923c]" />
                <p className="mb-4 text-center text-[#4f536c]">{error}</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-md border border-transparent bg-[#012e4a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#036280] focus:ring-2 focus:ring-[#012e4a] focus:ring-offset-2 focus:outline-none"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CheckCircle className="mb-4 h-16 w-16 text-[#012e4a]" />
                <p className="mb-4 text-center text-[#4f536c]">
                  Your email has been successfully verified!
                </p>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="flex w-full justify-center rounded-md border border-transparent bg-[#012e4a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#036280] focus:ring-2 focus:ring-[#012e4a] focus:ring-offset-2 focus:outline-none"
                >
                  Continue to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
