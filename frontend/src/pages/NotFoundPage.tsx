import { Link } from "react-router-dom";
import logo from "../assets/dark-bg-logo.svg";

const NotFoundPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 p-4 text-center">
      <img
        src={logo}
        alt="logo"
        className="relative top-0 left-0 mr-auto w-22 sm:block md:absolute md:top-4 md:left-4 md:w-28 lg:w-30"
      />
      <div className="rounded-lg bg-white p-8 shadow-xl md:p-12">
        <h1 className="text-9xl font-bold tracking-widest text-gray-800">
          404
        </h1>
        <div className="bg-primary absolute rotate-12 rounded-full px-2 text-sm text-white">
          Page Not Found
        </div>
        <p className="mt-8 text-xl text-gray-600">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="bg-primary hover:bg-hover mt-6 inline-block rounded-md px-6 py-3 font-semibold text-white transition-transform duration-300 hover:scale-105"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
