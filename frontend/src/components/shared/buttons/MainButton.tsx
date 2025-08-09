import clsx from "clsx";

export default function MainButton({
  disabled,
  loading,
  label,
  className,
  onClick,
}: MainButtonTypes) {
  return (
    <button
      onClick={onClick}
      type="submit"
      disabled={disabled || loading}
      className={clsx(
        "bg-primary hover:bg-hover disabled:hover:bg-primary relative flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-transparent text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {loading ? (
        <svg
          className="size-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        label
      )}
    </button>
  );
}

interface MainButtonTypes {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
  onClick?: () => void;
}
