import { useState } from "react";
import clsx from "clsx";
import eye_icon from "../../../assets/eye.svg"; // Assuming correct path
import eye_off_icon from "../../../assets/eye-off.svg"; // Assuming correct path

interface TextInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  containerClassName?: string;
  // Make 'value' and 'onChange' optional to allow for uncontrolled usage.
  value?: string | number | readonly string[] | null | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  // Add 'defaultValue' for explicit uncontrolled usage.
  defaultValue?: string | number | readonly string[] | null | undefined;
  // Add 'readOnly' prop to allow explicit control over input mutability.
  readOnly?: boolean;
}

export default function TextInput({
  name,
  type = "text",
  placeholder,
  containerClassName,
  value, // Now optional
  onChange, // Now optional
  error,
  defaultValue, // New prop for uncontrolled inputs
  readOnly, // New prop for read-only state
}: TextInputProps) {
  const [isPassword, changeIsPassword] = useState<boolean>(true);

  // Determine if the input is intended to be controlled.
  // An input is controlled if its 'value' prop is explicitly provided (not undefined).
  const isControlled = value !== undefined;

  // Determine the effective 'readOnly' state.
  // It's read-only if explicitly set, OR if it's controlled but no 'onChange' handler is provided.
  const effectiveReadOnly =
    readOnly !== undefined ? readOnly : isControlled && !onChange;

  // Conditionally apply 'value'/'onChange' for controlled inputs, or 'defaultValue' for uncontrolled.
  // We ensure that 'value' or 'defaultValue' are never 'null' or 'undefined' for the actual input element.
  const inputProps = isControlled
    ? {
        value: value === null ? "" : value,
        onChange: onChange, // Passed even if undefined, to fulfill React's requirement for controlled inputs
      }
    : {
        defaultValue: defaultValue === null ? "" : defaultValue,
        onChange: onChange, // onChange can still be provided for uncontrolled inputs (e.g., for validation on blur)
      };

  return (
    <div className={clsx("mb-9 w-full", containerClassName)}>
      <div className="relative">
        <input
          onClick={(e) => e.stopPropagation()}
          name={name}
          id={name}
          type={type === "password" && isPassword ? "password" : type}
          placeholder={placeholder || ""}
          {...inputProps} // Apply the dynamically determined props
          readOnly={effectiveReadOnly} // Apply the calculated read-only state
          className={clsx(
            `focus:ring-none w-full border-b border-gray-300 p-2 placeholder-gray-400 transition-colors focus:outline-none`,
            {
              "border-red-300": error,
            },
          )}
        />
        {type === "password" && (
          <span
            onClick={() => changeIsPassword(!isPassword)}
            className="absolute top-1/2 right-[4%] -translate-y-1/2 cursor-pointer"
          >
            {!isPassword ? (
              <img src={eye_icon} alt="eye icon" className="w-4" />
            ) : (
              <img
                src={eye_off_icon}
                alt="invisible eye icon"
                className="w-4"
              />
            )}
          </span>
        )}
        {error && (
          <p
            className={`absolute top-full left-0 inline-block translate-y-2 px-2 text-xs text-red-500`}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
