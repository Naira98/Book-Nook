import { ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dark-bg-logo.svg";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
      <img
        src={logo}
        alt="logo"
        className="relative top-0 left-0 mr-auto w-22 sm:block md:absolute md:top-4 md:left-4 md:w-28 lg:w-30"
      />
      <div className="border-primary/30 w-full max-w-md rounded-xl border-2 border-dashed bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Lock className="text-primary h-8 w-8" />
          </div>

          <h1 className="text-primary mb-2 text-2xl font-bold">
            Access Denied
          </h1>
          <p className="text-layout mb-6 text-center">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="border-primary bg-primary focus:ring-primary hover:bg-hover flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-white shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to previous page
          </button>
        </div>
      </div>

      <div className="text-layout mt-8 text-sm">
        Need help?{" "}
        <a
          href="mailto:book.nook.eglib@gmail.com"
          className="text-primary hover:text-hover hover:underline"
        >
          Contact support
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
