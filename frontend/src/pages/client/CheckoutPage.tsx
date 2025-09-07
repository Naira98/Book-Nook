import Decimal from "decimal.js";
import type { FormApi } from "final-form";
import {
  PackageX,
  ShoppingCart,
  Store,
  Tag,
  Truck,
  Wallet,
} from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { Field, Form } from "react-final-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import FullScreenSpinner from "../../components/shared/FullScreenSpinner";
import Modal from "../../components/shared/Modal";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useApplyPromoCode } from "../../hooks/cart/useApplyPromoCode";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { useGetAddress } from "../../hooks/cart/useGetUserAddress";
import { useCreateOrder } from "../../hooks/orders/useCreateOrder";
import { useCreateCheckoutSession } from "../../hooks/transactions/useCreateCheckoutSession";
import { PickUpType } from "../../types/Orders";
import type { PromoCodeData } from "../../types/promoCode";
import { formatMoney } from "../../utils/formatting";
import { getPosition } from "../../utils/getUserPosition";

type Prices = {
  purchase_total: Decimal;
  borrow_total: Decimal;
  deposit_total: Decimal;
  delivery: Decimal;
  promo_code: Decimal;
  total: Decimal;
};

type CourierInfo = {
  phone: string;
  address: string;
};

export default function CheckoutPage() {
  const { me } = useGetMe();
  const formRef = useRef<FormApi<CourierInfo, Partial<CourierInfo>>>(null);
  const { getAddress, isPending: isAddressPending } = useGetAddress();
  const { cartItems, isPending: isCartPending, error } = useGetCartItems(0);
  const { createOrder } = useCreateOrder();
  const { applyPromoCode, isPending: isPromoCodePending } = useApplyPromoCode();
  const { createCheckoutSession, isPending: isCheckoutPending } =
    useCreateCheckoutSession();
  const [pickupType, setPickupType] = useState<PickUpType>(PickUpType.SITE);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeObject, setPromoCodeObject] = useState<PromoCodeData | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const navigate = useNavigate();

  const [prices, setPrices] = useState<Prices>({
    purchase_total: new Decimal(0),
    borrow_total: new Decimal(0),
    deposit_total: new Decimal(0),
    delivery: new Decimal(0),
    promo_code: new Decimal(0),
    total: new Decimal(0),
  });

  useLayoutEffect(() => {
    if (
      cartItems &&
      cartItems.borrow_items?.length === 0 &&
      cartItems.purchase_items?.length === 0
    ) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (cartItems) {
      calculateTotal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, pickupType, promoCodeObject]);

  const calculateTotal = () => {
    if (!cartItems) return;
    const newPrices: Prices = {
      purchase_total: new Decimal(0),
      borrow_total: new Decimal(0),
      deposit_total: new Decimal(0),
      delivery: new Decimal(0),
      promo_code: new Decimal(0),
      total: new Decimal(0),
    };

    // Calculate Purchase Total
    const purchaseTotal =
      cartItems?.purchase_items?.reduce(
        (sum, b) =>
          new Decimal(sum).plus(new Decimal(b.book_price).times(b.quantity)),
        new Decimal(0),
      ) || new Decimal(0);

    newPrices.purchase_total = purchaseTotal;

    // Calculate Borrow Total
    const borrowTotal =
      cartItems?.borrow_items?.reduce(
        (sum, b) =>
          new Decimal(sum).plus(
            new Decimal(b.borrow_fees_per_week).times(b.borrowing_weeks),
          ),
        new Decimal(0),
      ) || new Decimal(0);
    newPrices.borrow_total = borrowTotal;

    // Calculate Deposit Total
    const depositTotal =
      cartItems?.borrow_items?.reduce(
        (sum, b) => new Decimal(sum).plus(new Decimal(b.deposit_fees)),
        new Decimal(0),
      ) || new Decimal(0);

    newPrices.deposit_total = depositTotal;

    // Calculate Promo code Total
    if (promoCodeObject?.id) {
      newPrices.promo_code = newPrices.promo_code
        .plus(
          purchaseTotal.times(
            new Decimal(promoCodeObject.discount_perc).div(100),
          ),
        )
        .plus(
          borrowTotal.times(
            new Decimal(promoCodeObject.discount_perc).div(100),
          ),
        );
    }

    // Calculate Delivery
    if (pickupType === "COURIER") {
      newPrices.delivery = newPrices.delivery.plus(
        new Decimal(cartItems.delivery_fees || 0),
      );
    }

    // Calculate final price
    const grandTotal = purchaseTotal
      .plus(borrowTotal)
      .plus(depositTotal)
      .plus(newPrices.delivery)
      .minus(newPrices.promo_code);

    newPrices.total = grandTotal;

    setPrices(newPrices);
  };

  const getUserAddress = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await getPosition()
      .then((position: GeolocationPosition) => {
        getAddress(position.coords, {
          onSuccess: (res) => {
            formRef?.current?.change("address", res.city);
          },
        });
      })
      .catch(() => {
        toast.error("Failed to get your location");
      });
  };

  const onSubmit = (values: CourierInfo) => {
    if (!cartItems) return;

    // Check if user has enough money in wallet
    const walletBalance = new Decimal(me?.wallet || 0);
    if (walletBalance.lessThan(prices.total)) {
      setShowPaymentModal(true);
      return;
    }

    const orderData = {
      pickup_type: pickupType,
      address: values.address,
      phone_number: values.phone,
      promo_code_id: promoCodeObject?.id,
    };
    createOrder(orderData);
  };

  // recives the current values
  const validate = (values: CourierInfo) => {
    const errors: Partial<CourierInfo> = {};

    if (pickupType === "COURIER") {
      if (!values.phone) {
        errors.phone = "Phone number is required";
      } else if (!/^\d{11}$/.test(values.phone)) {
        errors.phone = "Invalid phone number";
      }

      if (!values.address) {
        errors.address = "Location is required";
      }
    }
    return errors;
  };

  const applyPromoCodeHandler = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!promoCode) return;
    applyPromoCode(
      { code: promoCode },
      {
        onSuccess: (res: PromoCodeData) => {
          const newPrices = { ...prices };
          newPrices.promo_code = new Decimal(res.discount_perc);
          setPrices(newPrices);
          setPromoCodeObject(res);
        },
        onError: () => {
          const newPrices = { ...prices };
          newPrices.promo_code = new Decimal(0);
          setPrices(newPrices);
          setPromoCodeObject(null);
          setPromoCode("");
        },
      },
    );
  };

  const addFund = () => {
    const amount = parseFloat(fundAmount) * 100; /* in piaster 100 for 1 EGP */
    if (amount > 0) {
      createCheckoutSession(amount, {
        onSuccess: () => {
          setShowPaymentModal(false);
        },
      });
    }
  };

  if (isCartPending) {
    return <FullScreenSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-red-500">
        <PackageX className="h-8 w-8" />
        Failed to load cart. Please try again.
      </div>
    );
  }

  if (
    !cartItems ||
    (!cartItems.purchase_items?.length && !cartItems.borrow_items?.length)
  ) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-gray-500">
        <PackageX className="h-8 w-8" />
        Your cart is empty
      </div>
    );
  }

  const walletBalance = new Decimal(me?.wallet || 0);
  const amountNeeded = prices.total.minus(walletBalance);

  return (
    <div className="bg-accent text-layout min-h-screen font-sans">
      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Insufficient Funds"
        size="md"
      >
        <div className="p-4">
          <div className="mb-4 flex items-center justify-center">
            <Wallet className="h-12 w-12 text-amber-500" />
          </div>
          <p className="mb-4 text-center">
            Your wallet balance is {formatMoney(walletBalance.toString())} EGP,
            but you need {formatMoney(prices.total.toString())} EGP to complete
            this purchase.
          </p>
          <p className="mb-6 text-center font-semibold">
            Please add at least {formatMoney(amountNeeded.toString())} EGP to
            complete your order.
          </p>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium">
              Amount to add (EGP)
            </label>
            <input
              type="number"
              min={amountNeeded.toNumber()}
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder={`Minimum ${formatMoney(amountNeeded.toString())} EGP`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 text-gray-800 transition-colors hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={addFund}
              disabled={
                isCheckoutPending ||
                !fundAmount ||
                parseFloat(fundAmount) < amountNeeded.toNumber()
              }
              className="bg-secondary disabled:bg-secondary/80 flex-1 cursor-pointer rounded-lg px-4 py-3 text-white transition-colors disabled:cursor-not-allowed"
            >
              {isCheckoutPending ? "Processing..." : "Add Funds"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Main Content Container with full-width layout */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title with consistent styling */}
        <h1 className="text-primary mb-10 flex items-center justify-center gap-4 text-center text-4xl font-extrabold">
          <ShoppingCart className="text-primary h-10 w-10" />
          Checkout
        </h1>

        {/* Wallet Balance Display */}
        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-md">
            <Wallet className="text-primary h-6 w-6" />
            <span className="font-semibold">Wallet Balance:</span>
            <span
              className={`font-bold ${walletBalance.lessThan(prices.total) ? "text-secondary" : "text-success"}`}
            >
              {formatMoney(walletBalance.toString())} EGP
            </span>
          </div>
        </div>

        {/* Combined Checkout Section */}
        <div className="rounded-2xl bg-white/95 p-6 shadow-xl md:p-8">
          {/* Borrow Books Section */}
          {cartItems.borrow_items?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-primary mb-4 text-2xl font-bold">
                Borrow Books
              </h2>
              <div className="space-y-4">
                {cartItems.borrow_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-none"
                  >
                    <img
                      src={item.book.cover_img}
                      alt={item.book.title}
                      className="h-24 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-layout font-medium">
                        {item.book.title}
                      </p>
                      <p className="text-layout/70 text-sm">
                        {item.book.author.name}
                      </p>
                      <p className="text-layout/70 mt-1 text-sm">
                        <span className="font-bold text-slate-600">
                          {item.borrowing_weeks}
                        </span>{" "}
                        {item.borrowing_weeks === 1 ? "week" : "weeks"} ×{" "}
                        <span className="text-slate-700">
                          ( {formatMoney(item.borrow_fees_per_week)}
                        </span>{" "}
                        EGP + deposit{" "}
                        <span className="text-primary">
                          {formatMoney(item.deposit_fees)}
                        </span>{" "}
                        EGP )
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-600">
                      {(
                        parseFloat(item.borrow_fees_per_week) *
                          item.borrowing_weeks +
                        parseFloat(item.deposit_fees)
                      ).toFixed(2)}{" "}
                      EGP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Books Section */}
          {cartItems.purchase_items?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-primary mb-4 text-2xl font-bold">
                Purchase Books
              </h2>
              <div className="space-y-4">
                {cartItems.purchase_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-none"
                  >
                    <img
                      src={item.book.cover_img}
                      alt={item.book.title}
                      className="h-24 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-layout font-medium">
                        {item.book.title}
                      </p>
                      <p className="text-layout/70 text-sm">
                        {item.book.author.name}
                      </p>
                      <p className="text-layout/70 mt-1 text-sm">
                        <span className="font-bold text-slate-600">
                          {item.quantity}{" "}
                        </span>{" "}
                        {item.quantity === 1 ? "book" : "books"} ×{" "}
                        <span className="text-slate-700">
                          {formatMoney(item.book_price)}
                        </span>{" "}
                        EGP
                      </p>
                    </div>
                    <p className="text-lg font-bold text-slate-600">
                      {(parseFloat(item.book_price) * item.quantity).toFixed(2)}{" "}
                      EGP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pickup Type Section */}
          <div className="mb-8">
            <h2 className="text-primary mb-4 text-2xl font-bold">
              Pickup Type
            </h2>
            <div className="text-layout space-y-4">
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50 ${
                  pickupType === PickUpType.SITE ? "bg-gray-100" : ""
                }`}
              >
                <input
                  type="radio"
                  name="pickup"
                  value={PickUpType.SITE}
                  checked={pickupType === "SITE"}
                  onChange={(e) =>
                    setPickupType(e.target.value as PickUpType.SITE)
                  }
                  className="form-radio text-secondary h-5 w-5"
                />
                <Store className="text-primary h-6 w-6" />
                <span className="font-medium">On-site Pickup</span>
                <span className="text-success ml-auto text-sm font-bold">
                  (Free)
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50 ${
                  pickupType === PickUpType.COURIER ? "bg-gray-100" : ""
                }`}
              >
                <input
                  type="radio"
                  name="pickup"
                  value={PickUpType.COURIER}
                  checked={pickupType === "COURIER"}
                  onChange={(e) =>
                    setPickupType(e.target.value as PickUpType.COURIER)
                  }
                  className="form-radio text-secondary h-5 w-5"
                />
                <Truck className="text-primary h-6 w-6" />
                <span className="font-medium">Courier Delivery</span>
                <span className="ml-auto text-sm font-bold text-amber-700">
                  (+{formatMoney(cartItems.delivery_fees) || 0} EGP)
                </span>
              </label>
            </div>
          </div>
          <Form
            onSubmit={onSubmit}
            validate={validate}
            initialValues={{
              phone: me?.phone_number,
            }}
            render={({ handleSubmit, submitting, form }) => {
              formRef.current = form;
              return (
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full flex-col gap-6"
                >
                  {/* Courier Info Section */}
                  {pickupType === "COURIER" && (
                    <div className="mb-8">
                      <h2 className="text-primary mb-4 text-2xl font-bold">
                        Delivery Details
                      </h2>

                      <div className="mb-4 flex items-center gap-2">
                        <Field name="phone">
                          {({ input, meta }) => (
                            <TextInput
                              name="phone"
                              type="text"
                              containerClassName="!mb-4"
                              placeholder="Phone Number"
                              value={input.value}
                              onChange={input.onChange}
                              error={
                                meta.touched && meta.error
                                  ? meta.error
                                  : undefined
                              }
                            />
                          )}
                        </Field>
                      </div>
                      <div className="mb-4 flex flex-col gap-2 md:flex-row">
                        <Field name="address">
                          {({ input, meta }) => (
                            <TextInput
                              name="address"
                              type="text"
                              containerClassName="!mb-4 flex-1"
                              placeholder="Address"
                              value={input.value}
                              onChange={input.onChange}
                              error={
                                meta.touched && meta.error
                                  ? meta.error
                                  : undefined
                              }
                            />
                          )}
                        </Field>

                        <MainButton
                          loading={isAddressPending}
                          onClick={getUserAddress}
                          className="bg-primary hover:bg-hover !w-full rounded-lg text-white md:!w-[120px]"
                        >
                          Locate me
                        </MainButton>
                      </div>
                    </div>
                  )}

                  {/* Promo Code Section */}
                  <div className="mb-8">
                    <h2 className="text-primary mb-2 text-2xl font-bold">
                      Promo Code
                    </h2>
                    <div className="flex w-full items-center gap-2">
                      <Tag className="text-primary h-6 w-6" />
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className={`focus:ring-none border-primary placeholder-layout/70 focus:border-secondary w-full border-b-1 p-2 transition-colors focus:outline-none`}
                      />
                      <MainButton
                        loading={isPromoCodePending}
                        disabled={!promoCode}
                        onClick={applyPromoCodeHandler}
                        className="bg-primary hover:bg-hover !w-[120px] rounded-lg px-4 py-2 text-white"
                      >
                        Apply
                      </MainButton>
                    </div>
                    {promoCodeObject?.id && (
                      <p className="text-success mt-2 text-sm font-medium">
                        Promo code applied!
                      </p>
                    )}
                  </div>

                  <div className="mb-8 flex flex-col items-center justify-between gap-4 font-bold">
                    {Object.keys(prices).map((key) =>
                      prices[key as keyof Prices].isZero() ? null : (
                        <div
                          key={key}
                          className="flex w-full items-center justify-between gap-2 capitalize last:border-t-2 last:border-gray-200 last:pt-4 last:text-3xl"
                        >
                          <span className="text-layout/80 font-medium">
                            {key.replace("_", " ")}:
                          </span>
                          <span
                            className={`font-bold ${
                              key === "total"
                                ? "text-primary text-2xl"
                                : key === "promo_code"
                                  ? "text-green-700"
                                  : key === "delivery"
                                    ? "text-amber-700"
                                    : key === "deposit_total"
                                      ? "text-slate-600"
                                      : key === "borrow_total"
                                        ? "text-slate-600"
                                        : key === "purchase_total"
                                          ? "text-slate-600"
                                          : "text-gray-600"
                            }`}
                          >
                            {key === "promo_code" ? "-" : ""}{" "}
                            {prices[key as keyof Prices]?.toFixed(2)} EGP
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Submit and Back Buttons */}
                  <div className="mt-12 flex w-full flex-col-reverse items-center justify-center gap-4 sm:flex-row">
                    <MainButton
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(-1);
                      }}
                      className="text-layout !w-full cursor-pointer rounded-md bg-gray-200 !px-4 !py-2 hover:bg-gray-300 md:!w-[200px]"
                    >
                      Back
                    </MainButton>
                    <MainButton
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="bg-primary hover:bg-hover !w-full cursor-pointer rounded-md !px-4 !py-2 text-white md:!w-[200px]"
                    >
                      Confirm Order
                    </MainButton>
                  </div>
                </form>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
