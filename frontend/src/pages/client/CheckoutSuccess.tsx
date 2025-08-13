import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_without_sharshora.svg";

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="text-text relative flex min-h-screen items-center justify-center bg-gradient-to-br p-8 text-center">
      <img
        src={logo}
        alt="logo"
        className="absolute top-4 left-4 w-24 md:w-28 lg:w-32"
      />

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl md:p-12">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <CheckCircle className="text-success h-12 w-12" />
        </div>

        <h1 className="mb-4 text-3xl font-bold md:text-4xl">
          Payment Successful!
        </h1>

        <p className="mb-8 text-lg text-gray-600">
          Your wallet has been successfully funded
        </p>

        <button
          onClick={() => navigate("/transactions")}
          className="group bg-primary hover:bg-primary/95 focus:ring-primary flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold text-white transition-all duration-300 hover:shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          <span>View Transactions</span>
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
