import clsx from "clsx";
import { LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo_without_sharshora.svg";
import { useGetMe } from "../hooks/auth/useGetMe";
import { useLogout } from "../hooks/auth/useLogout";
import { getHomePath } from "../utils/getHomePath";

interface navItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const Sidebar = ({ navItems }: { navItems: navItem[] }) => {
  const { me } = useGetMe();
  const location = useLocation();
  const { logout } = useLogout();

  const isActiveLink = (item: navItem) => {
    if (item.to === "/staff/orders") {
      return (
        location.pathname === "/staff/orders" ||
        location.pathname.startsWith("/staff/order/") ||
        location.pathname.startsWith("/staff/return-orders/")
      );
    }
    return location.pathname.startsWith(item.to);
  };

  return (
    <aside className="text-text flex h-screen w-16 flex-col gap-8 border-r-1 border-slate-100 bg-white p-2 transition-all duration-300 md:w-56 lg:w-72">
      <Link
        to={getHomePath(me!.role, me!.interests)}
        className="flex justify-center pt-4 md:pt-6"
      >
        <img src={logo} alt="logo" className="mb-4 w-16 md:w-20 lg:w-32" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <nav className="flex flex-col space-y-2 md:space-y-3 px-2">
          {navItems.map((item) => {
            const isActive = isActiveLink(item);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  "flex items-center justify-center rounded-lg p-2 md:justify-start md:px-3 md:py-2",
                  "transition-all duration-200",
                  isActive
                    ? "bg-accent text-secondary border-l-2 md:border-l-3 lg:border-l-4"
                    : "text-layout hover:bg-slate-200",
                )}
              >
                <span
                  className={clsx(
                    "text-xl md:text-xl lg:text-2xl",
                    isActive && "text-secondary",
                  )}
                >
                  {item.icon}
                </span>
                <span className="ml-2 hidden text-sm font-medium md:block lg:ml-3 lg:text-base">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-accent border-t p-4 md:pt-6">
          <div className="flex flex-col items-start gap-y-1">
            <div className="hidden w-full cursor-default items-center px-3 py-2 md:flex">
              <User className="text-layout min-h-6 min-w-6" />
              <span className="ml-2 flex flex-col">
                <span className="text-secondary line-clamp-1 text-sm font-bold md:text-base">
                  {me?.first_name} {me?.last_name}
                </span>
                <span className="text-layout line-clamp-1 text-xs md:text-sm">
                  {me?.email}
                </span>
              </span>
            </div>

            <button
              onClick={() => logout()}
              className={clsx(
                "flex w-full items-center justify-center rounded-md p-2 text-sm transition-all md:justify-start md:px-3 md:py-2",
                "text-layout cursor-pointer hover:bg-slate-200",
              )}
              tabIndex={0}
            >
              <LogOut className="text-layout h-5 w-5 md:h-6 md:w-6" />
              <span className="ml-2 hidden text-sm font-medium md:block">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
