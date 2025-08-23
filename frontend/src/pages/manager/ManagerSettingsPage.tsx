import { useState, useEffect } from "react";
import { Form, Field } from "react-final-form";
import { useGetSettings } from "../../hooks/manager/useGetSettings";
import { useUpdateSettings } from "../../hooks/manager/useUpdateSettings";
import TextInput from "../../components/shared/formInputs/TextInput";
import type { Settings } from "../../types/Settings";

interface SettingsFormValues {
  deposit_perc: number;
  borrow_perc: number;
  delay_perc: number;
  delivery_fees: number;
  min_borrow_fee: number;
  max_num_of_borrow_books: number;
}

const ManagerSettingsPage = () => {
  const { settings, isPending: isLoading, error: loadError } = useGetSettings();
  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error: updateError,
    isSuccess,
  } = useUpdateSettings();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-error/20 text-error rounded-md p-4">
        Error loading settings: {loadError.message}
      </div>
    );
  }

  // Convert string values from API to numbers for the form
  const initialValues: SettingsFormValues = {
    deposit_perc: settings?.deposit_perc
      ? parseFloat(settings.deposit_perc)
      : 0,
    borrow_perc: settings?.borrow_perc ? parseFloat(settings.borrow_perc) : 0,
    delay_perc: settings?.delay_perc ? parseFloat(settings.delay_perc) : 0,
    delivery_fees: settings?.delivery_fees
      ? parseFloat(settings.delivery_fees)
      : 0,
    min_borrow_fee: settings?.min_borrow_fee
      ? parseFloat(settings.min_borrow_fee)
      : 0,
    max_num_of_borrow_books: settings?.max_num_of_borrow_books || 0,
  };

  const onSubmit = (values: SettingsFormValues) => {
    // Convert numbers back to strings for the API
    const apiValues: Partial<Settings> = {
      deposit_perc: values.deposit_perc.toString(),
      borrow_perc: values.borrow_perc.toString(),
      delay_perc: values.delay_perc.toString(),
      delivery_fees: values.delivery_fees.toString(),
      min_borrow_fee: values.min_borrow_fee.toString(),
      max_num_of_borrow_books: values.max_num_of_borrow_books,
    };
    updateSettings(apiValues);
  };

  const validate = (values: SettingsFormValues) => {
    const errors: Partial<Record<keyof SettingsFormValues, string>> = {};

    if (values.deposit_perc < 0 || values.deposit_perc > 100) {
      errors.deposit_perc = "Deposit percentage must be between 0 and 100";
    }

    if (values.borrow_perc < 0 || values.borrow_perc > 100) {
      errors.borrow_perc = "Borrow percentage must be between 0 and 100";
    }

    if (values.delay_perc < 0 || values.delay_perc > 100) {
      errors.delay_perc = "Delay percentage must be between 0 and 100";
    }

    if (values.delivery_fees < 0) {
      errors.delivery_fees = "Delivery fees cannot be negative";
    }

    if (values.min_borrow_fee < 0) {
      errors.min_borrow_fee = "Minimum borrow fee cannot be negative";
    }

    if (values.max_num_of_borrow_books < 1) {
      errors.max_num_of_borrow_books =
        "Maximum number of borrow books must be at least 1";
    }

    return errors;
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-primary mb-6 text-3xl font-bold">
          Library Settings
        </h1>

        {showSuccess && (
          <div className="bg-success/20 text-success mb-6 rounded-md p-4">
            Settings updated successfully!
          </div>
        )}

        {updateError && (
          <div className="bg-error/20 text-error mb-6 rounded-md p-4">
            Error updating settings: {updateError.message}
          </div>
        )}

        <Form
          onSubmit={onSubmit}
          initialValues={initialValues}
          validate={validate}
          render={({ handleSubmit, submitting, pristine }) => (
            <form onSubmit={handleSubmit} className="rounded-lg p-6">
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <h2 className="text-secondary text-xl font-semibold md:col-span-2">
                  Financial Settings
                </h2>

                <Field name="deposit_perc">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="deposit_perc"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Deposit Percentage (%)
                      </label>
                      <TextInput
                        name="deposit_perc"
                        type="number"
                        placeholder="Deposit Percentage"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>

                <Field name="borrow_perc">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="borrow_perc"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Borrow Percentage (%)
                      </label>
                      <TextInput
                        name="borrow_perc"
                        type="number"
                        placeholder="Borrow Percentage"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>

                <Field name="delay_perc">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="delay_perc"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Delay Percentage (%)
                      </label>
                      <TextInput
                        name="delay_perc"
                        type="number"
                        placeholder="Delay Percentage"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>

                <Field name="delivery_fees">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="delivery_fees"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Delivery Fees (EGP)
                      </label>
                      <TextInput
                        name="delivery_fees"
                        type="number"
                        placeholder="Delivery Fees"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>

                <Field name="min_borrow_fee">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="min_borrow_fee"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Minimum Borrow Fee (EGP)
                      </label>
                      <TextInput
                        name="min_borrow_fee"
                        type="number"
                        placeholder="Minimum Borrow Fee"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>

                <Field name="max_num_of_borrow_books">
                  {({ input, meta }) => (
                    <div className="mb-4">
                      <label
                        htmlFor="max_num_of_borrow_books"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Maximum Borrow Books
                      </label>
                      <TextInput
                        name="max_num_of_borrow_books"
                        type="number"
                        placeholder="Maximum Borrow Books"
                        value={input.value}
                        onChange={input.onChange}
                        error={meta.touched && meta.error}
                      />
                    </div>
                  )}
                </Field>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={submitting || pristine}
                  className="bg-primary hover:bg-hover rounded-md px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}
        />
      </div>
    </div>
  );
};

export default ManagerSettingsPage;
