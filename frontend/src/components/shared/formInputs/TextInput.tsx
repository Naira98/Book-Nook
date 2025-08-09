import { useState } from "react";
import clsx from "clsx";
import eye_icon from "../../../assets/eye.svg";
import eye_off_icon from "../../../assets/eye-off.svg";

interface TextInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  containerClassName?: string;
  value: string | number | readonly string[] | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export default function TextInput({
  name,
  type = "text",
  placeholder,
  containerClassName,
  value,
  onChange,
  error,
}: TextInputProps) {
  const [isPassword, changeIsPassword] = useState<boolean>(true);

  return (
    <div className={clsx("mb-9 w-full", containerClassName)}>
      <div className="relative">
        <input
          onClick={(e) => e.stopPropagation()}
          name={name}
          id={name}
          type={type === "password" && isPassword ? "password" : type}
          placeholder={placeholder || ""}
          value={value || ''}
          onChange={onChange}
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
              <img
                src={eye_icon}
                alt="eye icon"
                className="w-4"
              />
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