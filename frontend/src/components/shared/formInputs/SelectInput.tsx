import clsx from "clsx";

interface SelectInputProps {
  name: string;
  placeholder: string;
  options: { id: number | string; name: string }[];
  containerClassName?: string;
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
}

const SelectInput = ({
  name,
  placeholder,
  options,
  containerClassName,
  value,
  onChange,
  error,
}: SelectInputProps) => {
  return (
    <div className={clsx("w-full", containerClassName)}>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={clsx(
            `focus:ring-none w-full border-b border-gray-300 p-2 text-gray-900 transition-colors focus:outline-none`,
            {
              "border-red-300": error,
              "text-gray-400": !value,
            },
          )}
        >
          <option value="" disabled className="text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.id} value={option.id} className="text-gray-900">
              {option.name}
            </option>
          ))}
        </select>
        {error && (
          <p className="absolute top-full left-0 inline-block translate-y-2 px-2 text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectInput;
