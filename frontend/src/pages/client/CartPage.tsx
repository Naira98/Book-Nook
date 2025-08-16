import { User } from "lucide-react";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import PurchaseCartItem from "../../components/cart/PurchaseCartItem";
import BorrowCartItem from "../../components/cart/BorrowCartItem";
import { useGetMe } from "../../hooks/auth/useGetMe";
import MainButton from "../../components/shared/buttons/MainButton";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems } = useGetCartItems();
  const navigaion = useNavigate();
  const { me } = useGetMe();
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <span className="text-lg font-bold text-white">B</span>
              </div>
              <span className="text-primary text-2xl font-bold">Book Nook</span>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button className="hover:text-primary p-2 text-gray-600 transition-colors">
                <User className="h-6 w-6" />
              </button>
              <div className="text-sm text-gray-700">
                <span>
                  {me?.first_name} {me?.last_name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span className="text-primary font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Left Side - Tables */}
          <div className="space-y-6 lg:col-span-2">
            {/* Purchase Books Table */}
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="bg-primary rounded-t-lg px-6 py-4 text-white">
                <h2 className="text-xl font-semibold">Purchase Books</h2>
              </div>

              {cartItems && cartItems?.purchase_items.length > 0 ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-3 text-left font-medium text-gray-700">
                            Item
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Quantity
                          </th>
                          <th className="w-[200px] px-2 py-3 text-center font-medium text-gray-700">
                            Price
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Total
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems?.purchase_items?.map((item) => (
                          <PurchaseCartItem key={item.id} purchaseItem={item} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No purchase items in cart</p>
                </div>
              )}
            </div>

            {/* Borrow Books Table */}
            <div className="rounded-lg border bg-white shadow-sm">
              <div className="bg-primary rounded-t-lg px-6 py-4 text-white">
                <h2 className="text-xl font-semibold">Borrow Books</h2>
              </div>

              {cartItems && cartItems?.borrow_items.length ? (
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-3 text-left font-medium text-gray-700">
                            Item
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Weeks
                          </th>
                          <th className="w-[200px] px-2 py-3 text-center font-medium text-gray-700">
                            Price/Week
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Total
                          </th>
                          <th className="px-2 py-3 text-center font-medium text-gray-700">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems?.borrow_items?.map((item) => (
                          <BorrowCartItem key={item.id} borrowItem={item} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No borrow items in cart</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex w-full items-center justify-end gap-4">
          <MainButton
            className="!w-[150px] bg-red-600 hover:bg-red-500"
            onClick={() => {
              navigaion("/checkout");
            }}
            label="Back"
          />
          <MainButton
            className="!w-[150px]"
            onClick={() => {
              navigaion("/checkout");
            }}
            label="Checkout"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
