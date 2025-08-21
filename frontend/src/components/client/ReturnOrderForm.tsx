import { MapPin, Phone, Store, Truck } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { useCreateReturnOrder } from "../../hooks/orders/useCreateReturnOrder";
import { PickUpType } from "../../types/Orders";
import type { IClientBorrows } from "../../types/ReturnOrder";
import MainButton from "../shared/buttons/MainButton";
import TextInput from "../shared/formInputs/TextInput";

interface ReturnOrderFormProps {
  selectedBooks: IClientBorrows[];
  onClose: () => void;
  onSuccess: () => void;
}

const ReturnOrderForm = ({
  selectedBooks,
  onClose,
  onSuccess,
}: ReturnOrderFormProps) => {
  const [formData, setFormData] = useState({
    pickup_type: PickUpType.SITE,
    address: "",
    phone_number: "",
  });

  const { createReturnOrder, isPending } = useCreateReturnOrder();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const returnOrderData = {
      ...formData,
      borrowed_books_ids: selectedBooks.map((book) => book.book_details_id),
    };

    createReturnOrder(returnOrderData, {
      onSuccess: () => {
        onSuccess();
        onClose();
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create Return Order
          </h2>
          <p className="text-gray-600">
            Return {selectedBooks.length} selected book
            {selectedBooks.length !== 1 ? "s" : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Books Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">
              Selected Books:
            </h3>
            <div className="space-y-2">
              {selectedBooks.map((book) => (
                <div
                  key={book.book_details_id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{book.book.title}</span>
                  <span className="text-gray-600">
                    ID: {book.book_details_id}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Pickup Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-gray-200 p-4">
                <input
                  type="radio"
                  name="pickup_type"
                  value="SITE"
                  checked={formData.pickup_type === "SITE"}
                  onChange={(e) =>
                    handleInputChange("pickup_type", e.target.value)
                  }
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <div className="flex items-center space-x-2">
                  <Store className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Site Pickup</span>
                </div>
              </label>

              <label className="hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border-2 border-gray-200 p-4">
                <input
                  type="radio"
                  name="pickup_type"
                  value="COURIER"
                  checked={formData.pickup_type === "COURIER"}
                  onChange={(e) =>
                    handleInputChange("pickup_type", e.target.value)
                  }
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Courier Pickup</span>
                </div>
              </label>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <MapPin className="mr-2 inline h-4 w-4" />
              Address
            </label>
            <TextInput
              type="text"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <Phone className="mr-2 inline h-4 w-4" />
              Phone Number
            </label>
            <TextInput
              type="tel"
              name="phone_number"
              placeholder="Enter your phone number"
              value={formData.phone_number}
              onChange={(e) =>
                handleInputChange("phone_number", e.target.value)
              }
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <MainButton disabled={isPending} className="px-6 py-2">
              Create Return Order
            </MainButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnOrderForm;
