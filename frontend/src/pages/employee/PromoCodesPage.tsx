import { ClipboardClock, Plus, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ToggleButton from "../../components/shared/buttons/ToggleButton";
import Spinner from "../../components/shared/Spinner";
import { useGetPromoCodes } from "../../hooks/promoCodes/useGetPromoCodes";
import { useUpdatePromoCode } from "../../hooks/promoCodes/useUpdatePromoCode";

const PromoCodesPage = () => {
  const navigate = useNavigate();
  const { promoCodes, isPending } = useGetPromoCodes();
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
      <span className="flex w-[70px] items-center justify-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
        Active
      </span>
    ) : (
      <span className="flex w-[70px] items-center justify-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
        Inactive
      </span>
    );
  };

  return (
    <div className="flex">
      <main className="w-full p-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Promo Codes</h1>
          <button
            onClick={() => navigate("/manager/promo-codes/create")}
            className="bg-primary hover:bg-primary/90 focus:ring-primary flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <Plus className="h-5 w-5" />
            Create New
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-3 gap-6 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-600">Code</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              Discount
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">
              Status & Actions
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="divide-y divide-gray-100">
          {!promoCodes || promoCodes.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <ClipboardClock className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="mb-2 text-lg font-medium text-gray-900">
                No promo codes found
              </p>
              <p>Start by creating your first promo code</p>
            </div>
          ) : (
            promoCodes.map((promoCode) => (
              <div
                key={promoCode.id}
                className="px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="grid grid-cols-3 items-center gap-6">
                  {/* Code Column */}
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-900">
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
