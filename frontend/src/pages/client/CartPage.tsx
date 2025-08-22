import { useNavigate } from "react-router-dom";
import BorrowCartItem from "../../components/cart/BorrowCartItem";
import PurchaseCartItem from "../../components/cart/PurchaseCartItem";
import MainButton from "../../components/shared/buttons/MainButton";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";

// Component to display the checkout page with cart items.
const CheckoutPage = () => {
  const { cartItems } = useGetCartItems();
  const navigate = useNavigate();

  return (
    <div className="bg-accent text-layout min-h-screen font-sans">
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <h1 className="text-primary mb-10 text-center text-4xl font-extrabold">
          Your Cart
        </h1>

        <div className="flex flex-col gap-12">
          {/* Purchase Books Section */}
          <div className="animate-fade-in-up rounded-2xl bg-white/95 p-6 shadow-xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-primary text-2xl font-bold">
                Purchase Books
              </h2>
              <span className="bg-secondary rounded-full px-3 py-1 text-sm font-semibold text-white">
                {cartItems?.purchase_items.length || 0} items
              </span>
            </div>
            <div className="space-y-6">
              {cartItems && cartItems?.purchase_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-accent border-b">
                        <th className="text-layout p-2 text-left font-medium">
                          Item
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Quantity
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Price
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Total
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
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
              ) : (
                <div className="text-layout/70 p-6 text-center">
                  <p>No items in your purchase cart.</p>
                </div>
              )}
            </div>
          </div>

          {/* Borrow Books Section */}
          <div className="animate-fade-in-up rounded-2xl bg-white/95 p-6 shadow-xl md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-primary text-2xl font-bold">Borrow Books</h2>
              <span className="bg-secondary rounded-full px-3 py-1 text-sm font-semibold text-white">
                {cartItems?.borrow_items.length || 0} items
              </span>
            </div>
            <div className="space-y-6">
              {cartItems && cartItems?.borrow_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-accent border-b">
                        <th className="text-layout p-2 text-left font-medium">
                          Item
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Weeks
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Price/Week
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
                          Total
                        </th>
                        <th className="text-layout p-2 text-center font-medium">
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
              ) : (
                <div className="text-layout/70 p-6 text-center">
                  <p>No items in your borrow cart.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex w-full flex-col-reverse items-center justify-center gap-4 sm:flex-row">
          <MainButton
            className="text-layout !w-full cursor-pointer rounded-xl bg-gray-200 hover:bg-gray-300 md:!w-[200px]"
            onClick={() => navigate(-1)}
          >
            Back
          </MainButton>
          <MainButton
            className="bg-primary hover:bg-hover !w-full cursor-pointer rounded-xl text-white md:!w-[200px]"
            onClick={() => navigate("/checkout")}
          >
            Checkout
          </MainButton>
        </div>
      </div>

      {/* Custom styles for prices + delete */}
      <style>{`
        td:nth-child(3),
        td:nth-child(4) {
          color: #16a34a; /* Tailwind green-600 */
          font-weight: 600;
        }

        button.delete-btn,
        .delete-btn {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
