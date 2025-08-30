import clsx from "clsx";
import type { MouseEvent, ReactNode } from "react";
import SmallSpinner from "./SmallSpinner";

export default function MainButton({
  disabled,
  loading,
  children,
  className,
  onClick,
}: MainButtonTypes) {
  return (
    <button
      onClick={onClick}
      type="submit"
      disabled={disabled || loading}
      className={clsx(
        "bg-primary hover:bg-hover disabled:hover:bg-primary relative flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium text-white transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
    >
      {loading ? <SmallSpinner /> : children}
    </button>
  );
}

interface MainButtonTypes {
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
