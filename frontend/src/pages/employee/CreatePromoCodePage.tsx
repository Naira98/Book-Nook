import { ArrowLeft, Tag } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/shared/Spinner";
import Sidebar from "../../components/Sidebar";
import { useCreatePromoCode } from "../../hooks/promoCodes/useCreatePromoCode";
import type { PromoCodeCreate } from "../../types/promoCode";

const CreatePromoCodePage = () => {
  const navigate = useNavigate();
  const { createPromoCode, isPending } = useCreatePromoCode();

  const [formData, setFormData] = useState<PromoCodeCreate>({
    code: "",
    discount_perc: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<Partial<PromoCodeCreate>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PromoCodeCreate> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Promo code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Promo code must be at least 3 characters";
    }

    if (!formData.discount_perc) {
      newErrors.discount_perc = "Discount percentage is required";
    } else {
      const discount = parseFloat(formData.discount_perc);
      if (isNaN(discount) || discount <= 0 || discount > 100) {
        newErrors.discount_perc = "Discount must be a number between 0 and 100";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    createPromoCode(formData, {
      onSuccess: () => {
        navigate("/employee/promo-codes");
      },
    });
  };

  const handleInputChange = (field: keyof PromoCodeCreate, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="flex">
      <Sidebar navItems={navItems} />
      <main className="w-full p-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/employee/promo-codes")}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">Create New Promo Code</h1>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Promo Code Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code *
              </label>
              <input
                id="code"
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g., SAVE20)"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            {/* Discount Percentage Field */}
            <div>
              <label htmlFor="discount_perc" className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage *
              </label>
              <div className="relative">
                <input
                  id="discount_perc"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.discount_perc}
                  onChange={(e) => handleInputChange("discount_perc", e.target.value)}
                  placeholder="Enter discount percentage"
                  className={`w-full px-3 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                    errors.discount_perc ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
              {errors.discount_perc && (
                <p className="mt-1 text-sm text-red-600">{errors.discount_perc}</p>
              )}
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange("is_active", e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Active (users can use this promo code)
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 focus:ring-primary flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? <Spinner /> : <Tag className="h-5 w-5" />}
                {isPending ? "Creating..." : "Create Promo Code"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/employee/promo-codes")}
                className="border border-gray-300 hover:bg-gray-50 rounded-lg px-6 py-3 font-semibold text-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePromoCodePage;

const navItems = [
  { to: "/employee/promo-codes", label: "Promo Codes", icon: <Tag /> },
];