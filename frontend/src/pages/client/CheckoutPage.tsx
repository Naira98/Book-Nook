import Decimal from "decimal.js";
import type { FormApi } from "final-form";
import {
  Loader2,
  PackageX,
  ShoppingCart,
  Store,
  Tag,
  Truck,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Field, Form } from "react-final-form";
import { toast } from "react-toastify";
import MainButton from "../../components/shared/buttons/MainButton";
import TextInput from "../../components/shared/formInputs/TextInput";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useApplyPromoCode } from "../../hooks/cart/useApplyPromoCode";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import { useGetAddress } from "../../hooks/cart/useGetUserAddress";
import { useCreateOrder } from "../../hooks/orders/useCreateOrder";
import { PickUpType } from "../../types/Orders";
import type { PromoCodeData } from "../../types/promoCode";
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

// CheckoutPage component with updated professional styling.
export default function CheckoutPage() {
  const { me } = useGetMe();
  const formRef = useRef<FormApi<CourierInfo, Partial<CourierInfo>>>(null);
  const { getAddress, isPending: isAddressPending } = useGetAddress();
  const { cartItems, isPending, error } = useGetCartItems(0);
  const { createOrder } = useCreateOrder();
  const { applyPromoCode, isPending: isPromoCodePending } = useApplyPromoCode();
  const [pickupType, setPickupType] = useState<PickUpType>(PickUpType.SITE);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeObject, setPromoCodeObject] = useState<PromoCodeData | null>(
    null,
  );

  const [prices, setPrices] = useState<Prices>({
    purchase_total: new Decimal(0),
    borrow_total: new Decimal(0),
    deposit_total: new Decimal(0),
    delivery: new Decimal(0),
    promo_code: new Decimal(0),
    total: new Decimal(0),
  });

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
        new Decimal(cartItems.delevary_fees || 0),
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

  if (isPending) {
    return (
      <div className="flex items-center justify-center gap-2 p-6 text-gray-600">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        Loading your cart...
      </div>
    );
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

  return (
    <div className="min-h-screen bg-accent font-sans text-layout">
      {/* Main Content Container with full-width layout */}
      <div className="container mx-auto px-4 py-12">
        {/* Page Title with consistent styling */}
        <h1 className="mb-10 flex items-center justify-center gap-4 text-center text-4xl font-extrabold text-primary">
          <ShoppingCart className="h-10 w-10 text-primary" />
          Checkout
        </h1>

        {/* Combined Checkout Section */}
        <div className="rounded-2xl bg-white/95 p-6 shadow-xl md:p-8">
          {/* Purchase Books Section */}
          {cartItems.purchase_items?.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-primary">Purchase Books</h2>
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
                      <p className="font-medium text-layout">{item.book.title}</p>
                      <p className="text-sm text-layout/70">
                        {item.book.author.name}
                      </p>
                      <p className="mt-1 text-sm text-layout/70">
                        <span className="font-bold text-success">
                          {item.quantity}
                        </span>{" "}
                        × {item.book_price} EGP
                      </p>
                    </div>
                    <p className="font-bold text-success">
                      {(parseFloat(item.book_price) * item.quantity).toFixed(2)} EGP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Borrow Books Section */}
          {cartItems.borrow_items?.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-primary">Borrow Books</h2>
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
                      <p className="font-medium text-layout">{item.book.title}</p>
                      <p className="text-sm text-layout/70">
                        {item.book.author.name}
                      </p>
                      <p className="mt-1 text-sm text-layout/70">
                        <span className="font-bold text-secondary">
                          {item.borrowing_weeks}
                        </span>{" "}
                        weeks × {item.borrow_fees_per_week} EGP + deposit{" "}
                        <span className="font-bold text-success">{item.deposit_fees}</span> EGP
                      </p>
                    </div>
                    <p className="font-bold text-success">
                      {(
                        parseFloat(item.borrow_fees_per_week) *
                          item.borrowing_weeks +
                        parseFloat(item.deposit_fees)
                      ).toFixed(2)} EGP
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pickup Type Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-primary">Pickup Type</h2>
            <div className="space-y-4 text-layout">
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
                  onChange={(e) => setPickupType(e.target.value as PickUpType.SITE)}
                  className="form-radio h-5 w-5 text-secondary"
                />
                <Store className="h-6 w-6 text-primary" />
                <span className="font-medium">On-site Pickup</span>
                <span className="ml-auto text-sm font-bold text-success">
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
                  className="form-radio h-5 w-5 text-secondary"
                />
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-medium">Courier Delivery</span>
                <span className="ml-auto text-sm font-bold text-layout">
                  (+{cartItems.delevary_fees || 0} EGP)
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
                      <h2 className="mb-4 text-2xl font-bold text-primary">
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
                                meta.touched && meta.error ? meta.error : undefined
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
                                meta.touched && meta.error ? meta.error : undefined
                              }
                            />
                          )}
                        </Field>

                        <MainButton
                          loading={isAddressPending}
                          onClick={getUserAddress}
                          label="Locate me"
                          className="!w-full rounded-lg bg-primary text-white hover:bg-hover md:!w-[120px]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Promo Code Section */}
                  <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-primary">
                      Promo Code
                    </h2>
                    <div className="flex w-full items-center gap-2">
                      <Tag className="h-6 w-6 text-primary" />
                      <input
                        type="text"
                        placeholder="Enter Promo Code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className={`focus:ring-none w-full border-b-2 border-accent p-2 placeholder-layout/70 transition-colors focus:border-secondary focus:outline-none`}
                      />
                      <MainButton
                        loading={isPromoCodePending}
                        disabled={!promoCode}
                        onClick={applyPromoCodeHandler}
                        className="!w-[120px] rounded-lg bg-primary px-4 py-2 text-white hover:bg-hover"
                        label="Apply"
                      />
                    </div>
                    {promoCodeObject?.id && (
                      <p className="mt-2 text-sm text-success font-medium">Promo code applied!</p>
                    )}
                  </div>

                  {/* Prices Section */}
                  <div className="mb-8 flex flex-col items-center justify-between gap-4 font-bold">
                    {Object.keys(prices).map((key) =>
                      prices[key as keyof Prices].isZero() ? null : (
                        <div
                          key={key}
                          className="flex w-full items-center justify-between gap-2 capitalize last:border-t-2 last:border-gray-200 last:pt-4 last:text-3xl"
                        >
                          <span className="font-medium text-layout/80">{key.replace("_", " ")}:</span>
                          <span className="text-success">
                            {key === "promo_code" ? "-" : ""}{" "}
                            {prices[key as keyof Prices]?.toFixed(2)} EGP
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Submit and Back Buttons */}
                  <div className="flex justify-center gap-4">
                    <MainButton
                      onClick={() => window.history.back()}
                      label="Back"
                      className="rounded-xl bg-gray-500 px-6 py-2 text-white transition-colors duration-300 hover:bg-gray-600"
                    />
                    <MainButton

                      disabled={submitting}
                      onClick={handleSubmit}
                      label="Confirm Order"
                      className="rounded-xl bg-primary px-6 py-2 text-white transition-colors duration-300 hover:bg-hover"
                    />
                  </div>
                </form>
              );
            }}
          />
        </div>
      </div>

                      loading={isAddressPending}
                      onClick={getUserAddress}
                      className="!w-[120px] rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                      Locate me
                    </MainButton>
                  </div>
                </div>
              )}

              {/* Promo Code */}
              <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-md">
                <div className="flex w-full items-center gap-2">
                  <Tag className="h-5 w-5 text-gray-500" />

                  <input
                    type="text"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={`focus:ring-none w-full border-b border-gray-300 p-2 placeholder-gray-400 transition-colors focus:outline-none`}
                  />
                  <MainButton
                    loading={isPromoCodePending}
                    disabled={!promoCode}
                    onClick={applyPromoCodeHandler}
                    className="!w-[120px] rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Apply
                  </MainButton>
                </div>
                {promoCodeObject?.id && (
                  <p className="text-sm text-green-600">Promo code applied!</p>
                )}
              </div>

              {/* Prices */}
              <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 text-lg font-bold shadow-md">
                {Object.keys(prices).map((key) =>
                  prices[key as keyof Prices].isZero() ? null : (
                    <div
                      key={key}
                      className="flex w-full items-center justify-between gap-2 capitalize last:border-t last:border-gray-400 last:pt-2"
                    >
                      <span>{key.replace("_", " ")}:</span>
                      <span>
                        {key === "promo_code" ? "-" : ""}{" "}
                        {prices[key as keyof Prices]?.toFixed(2)} EGP
                      </span>
                    </div>
                  ),
                )}
              </div>

              {/* Submit */}
              <MainButton disabled={submitting} onClick={handleSubmit}>
                Confirm Order
              </MainButton>
            </form>
          );
        }}
      />

    </div>
  );
}
