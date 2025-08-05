import type { ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import logo from "../../assets/dark-bg-logo.svg";

export default function AuthLayout({
  children,

  cardClassName,
  title = "Welcome to Book Nook",
}: {
  children: ReactNode;
  cardClassName?: string;
  title?: string;
}) {
  return (
    <div className="bg-background relative flex h-screen w-screen flex-col items-center justify-start gap-4 p-4 md:justify-center">
      <Link to="/login">
        <img
          src={logo}
          alt="logo"
          className="relative top-0 left-0 mr-auto w-22 sm:block md:absolute md:top-4 md:left-4 md:w-28 lg:w-30"
        />
      </Link>
      <div className="flex w-full flex-1 items-center justify-center">
        <div
          className={clsx(
            "flex max-h-[calc(100vh-80px)] min-h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg",
            cardClassName,
          )}
        >
          <div className="relative w-full p-4 text-center">
            <h2 className="text-primary relative z-10 text-2xl font-bold">
              {title}
            </h2>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
