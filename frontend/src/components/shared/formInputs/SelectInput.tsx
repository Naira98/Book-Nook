import { Field } from "react-final-form";
import clsx from "clsx";

interface SelectInputProps {
  name: string;
  placeholder: string;
  options: { id: number; name: string }[];
  containerClassName?: string;
}

const SelectInput = ({
  name,
  placeholder,
  options,
  containerClassName,
}: SelectInputProps) => {
  return (
    <Field name={name}>
      {({ input, meta }) => (
        <div className={clsx("mb-9 w-full", containerClassName)}>
          <div className="relative">
            <select
              {...input}
              className={clsx(
                `focus:ring-none w-full border-b border-gray-300 p-2 text-gray-900 transition-colors focus:outline-none`,
                {
                  "border-red-300": meta.error && meta.touched,
                  "text-gray-400": !input.value,
                },
              )}
            >
              <option value="" className="text-gray-400">
                {placeholder}
              </option>
              {options.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  className="text-gray-900"
                >
                  {option.name}
                </option>
              ))}
            </select>
            {meta.error && meta.touched && (
              <p className="absolute top-full left-0 inline-block translate-y-2 px-2 text-xs text-red-500">
                {meta.error}
              </p>
            )}
          </div>
        </div>
      )}
    </Field>
  );
};

export default SelectInput;
