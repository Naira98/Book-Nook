import clsx from "clsx";
import type { MouseEvent } from "react";
import Spinner from "../Spinner";

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
        "bg-primary hover:bg-hover disabled:hover:bg-primary relative flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-transparent text-sm font-medium text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70 px-4",
        className,
      )}
    >
      {loading ? <Spinner /> : label}
    </button>
  );
}

interface MainButtonTypes {
  disabled?: boolean;
  loading?: boolean;
  label?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
