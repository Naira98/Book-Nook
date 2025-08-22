import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  ClipboardClock,
  Plus,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToggleButton from "../../components/shared/buttons/ToggleButton";
import Spinner from "../../components/shared/Spinner";
import Sidebar from "../../components/Sidebar";
import { useUpdatePromoCode } from "../../hooks/promoCodes/useUpdatePromoCode";
import apiReq from "../../services/apiReq";
import type { PromoCodeData } from "../../types/promoCode";

const PromoCodesPage = () => {
  const navigate = useNavigate();
  const { data: promoCodes, isPending } = useQuery<PromoCodeData[]>({
    queryKey: ["promoCodes"],
    queryFn: async () => {
      return await apiReq("GET", "/promo-codes");
    },
    staleTime: 1000 * 60 * 5,
  });
  const { updatePromoCode } = useUpdatePromoCode();

  if (isPending) return <Spinner />;

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    updatePromoCode({
      id,
      data: { is_active: !currentStatus },
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="w-[70px] flex justify-center items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        Active
      </span>
    ) : (
      <span className="w-[70px] flex justify-center items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        Inactive
      </span>
    );
  };

  return (
    <div className="flex">
      <Sidebar navItems={navItems} />
      <main className="w-full p-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <button
            onClick={() => navigate("/employee/promo-codes/create")}
            className="bg-primary hover:bg-primary/90 focus:ring-primary flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Plus className="h-5 w-5" />
            Create New
          </button>
        </div>

        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 grid grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">Code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Discount</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Status & Actions</span>
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          {!promoCodes || promoCodes.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ClipboardClock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">No promo codes found</p>
              <p>Start by creating your first promo code</p>
            </div>
          ) : (
            promoCodes.map((promoCode) => (
              <div
                key={promoCode.id}
                className="px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="grid grid-cols-3 gap-6 items-center">
                  {/* Code Column */}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-lg">
                      {promoCode.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: #{promoCode.id}
                    </div>
                  </div>

                  {/* Discount Column */}
                  <div className="flex-1">
                    <div className="text-primary text-xl font-semibold">
                      {promoCode.discount_perc}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Discount percentage
                    </div>
                  </div>

                  {/* Status Column */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      {getStatusBadge(promoCode.is_active)}
                    </div>
                    <div className="flex items-center">
                      <ToggleButton
                        checked={promoCode.is_active}
                        onClick={() =>
                          handleToggleActive(promoCode.id, promoCode.is_active)
                        }
                      />
                    </div>  
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PromoCodesPage;

const navItems = [
  { to: "/employee/promo-codes", label: "Promo Codes", icon: <Tag /> },
  { to: "/employee/books", label: "Books", icon: <ClipboardClock /> },
  { to: "/employee/orders", label: "Orders", icon: <Calendar /> },
];