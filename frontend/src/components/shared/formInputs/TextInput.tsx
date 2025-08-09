import { useState } from "react";
import clsx from "clsx";
import type { TextInputTypes } from "../../../types/shared/formInputs";
import { Field } from "react-final-form";
import eye_icon from "../../../assets/eye.svg";
import eye_off_icon from "../../../assets/eye-off.svg";

export default function TextInput({
  type = "text",
  placeholder,
  containerClassName,
  name,
}: TextInputTypes) {
  const [isPassword, changeIsPassword] = useState<boolean>(true);

  return (
    <Field name={name}>
      {({ input, meta }) => (
        <div className={clsx("mb-9 w-full", containerClassName)}>
          <div className="relative">
            <input
              onClick={(e) => e.stopPropagation()}
              type={!isPassword ? "text" : type}
              id={name}
              placeholder={placeholder ? placeholder : ""}
              className={clsx(
                `focus:ring-none w-full border-b border-gray-300 p-2 placeholder-gray-400 transition-colors focus:outline-none`,
                {
                  "border-red-300": meta.error && meta.touched,
                },
              )}
              {...input}
            />
            {type == "password" && (
              <span
                onClick={() => changeIsPassword(!isPassword)}
                className="absolute top-1/2 right-[4%] -translate-y-1/2 cursor-pointer"
              >
                {!isPassword ? (
                  <img
                    onClick={() => changeIsPassword(!isPassword)}
                    src={eye_icon}
                    alt="eye icon"
                    className="w-4"
                  />
                ) : (
                  <img
                    onClick={() => changeIsPassword(!isPassword)}
                    src={eye_off_icon}
                    alt="invisible eye icon"
                    className="w-4"
                  />
                )}
              </span>
            )}
            {meta.error && meta.touched && (
              <p
                className={`absolute top-full left-0 inline-block translate-y-2 px-2 text-xs text-red-500`}
              >
                {meta.error}
              </p>
            )}
          </div>
        </div>
      )}
    </Field>
  );
}
