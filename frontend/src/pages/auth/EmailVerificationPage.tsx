import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { RotateCw, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import animationData from "../../assets/json/Success.json";
import logo from "../../assets/logo_without_sharshora.svg";
import { useEmailVerification } from "../../hooks/auth/useEmailVerification";

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [hasNavigated, setHasNavigated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { emailVerification, isPending } = useEmailVerification();
  
  // Extract token from URL
  const token = searchParams.get("token");
  
  // Process verification immediately (runs once when component mounts)
  if (token && !error && !isPending) {
    emailVerification(
      { token },
      {
        onError: (err: Error) => {
          setError(err.message || "Invalid or expired verification token");
        },
      },
    );
  } else if (!token) {
    setError("No verification token found in URL");
  }

  const handleAnimationComplete = () => {
    setTimeout(() => {
      if (!hasNavigated && !error) {
        setHasNavigated(true);
        navigate("/login");
      }
    }, 1000);
  };

  if (!token) {
    return (
      <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
        <img
          src={logo}
          alt="logo"
          className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
        />
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <XCircle className="h-full w-full text-[#fb923c]" />
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Verification Failed
          </h1>
          <p className="mb-6 text-lg text-gray-600">No verification token found in URL</p>
          <button
            onClick={() => navigate("/login")}
            className="rounded-md border border-[#012e4a] px-6 py-3 text-[#012e4a] transition-colors hover:bg-[#012e4a] hover:text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
        <img
          src={logo}
          alt="logo"
          className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
        />
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <RotateCw className="h-16 w-16 animate-spin text-[#012e4a]" />
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Verifying Email...
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Please wait while we verify your email address
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
        <img
          src={logo}
          alt="logo"
          className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
        />
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
            <XCircle className="h-full w-full text-[#fb923c]" />
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">
            Verification Failed
          </h1>
          <p className="mb-6 text-lg text-gray-600">{error}</p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-md bg-[#012e4a] px-6 py-3 text-white transition-colors hover:bg-[#036280]"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/login")}
              className="rounded-md border border-[#012e4a] px-6 py-3 text-[#012e4a] transition-colors hover:bg-[#012e4a] hover:text-white"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
      <img
        src={logo}
        alt="logo"
        className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
      />
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
        <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={true}
            onComplete={handleAnimationComplete}
            className="h-full w-full"
          />
        </div>
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Email Verified!</h1>
        <p className="mb-8 text-lg text-gray-600">
          Your email has been successfully verified
        </p>
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          <p>Redirecting to login in a few seconds...</p>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="w-full rounded-md bg-[#012e4a] px-6 py-3 text-white transition-colors hover:bg-[#036280]"
        >
          Continue to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;