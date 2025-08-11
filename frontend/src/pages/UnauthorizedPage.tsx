import { Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/dark-bg-logo.svg";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <img
        src={logo}
        alt="logo"
        className="relative top-0 left-0 mr-auto w-22 sm:block md:absolute md:top-4 md:left-4 md:w-28 lg:w-30"
      />
      <div className="w-full max-w-md rounded-xl border-2 border-dashed border-cyan-200 bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100">
            <Lock className="h-8 w-8 text-cyan-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Access Denied
          </h1>
          <p className="mb-6 text-center text-gray-600">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border-2 border-cyan-400 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-600 shadow-sm transition-all hover:bg-cyan-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to previous page
          </button>
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Need help?{" "}
        <a
          href="mailto:book.nook.eglib@gmail.com"
          className="text-cyan-600 hover:underline"
        >
          Contact support
        </a>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
