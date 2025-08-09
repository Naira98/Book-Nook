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
            "flex max-h-[calc(100vh-80px)] min-h-[500px] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-lg",
            cardClassName,
          )}
        >
          <div className="relative w-full p-4 text-center">
            {/* <img
              src="src/assets/light-bg-logo.svg"
              className="pointer-events-none absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 transform opacity-15"
            /> */}
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
