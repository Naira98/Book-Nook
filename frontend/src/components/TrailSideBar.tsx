import clsx from "clsx";
import { LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logo from "../assets/logo_without_sharshora.svg";
import { useGetMe } from "../hooks/auth/useGetMe";
import { useLogout } from "../hooks/auth/useLogout";

interface SidebarProps {
  navItems: { to: string; label: string; icon: ReactNode }[];
}

const TrailSideBar = ({ navItems }: SidebarProps) => {
  const { me } = useGetMe();
  const location = useLocation();
  const { logout } = useLogout();

  return (
    <aside className="text-text flex h-screen w-16 flex-col gap-8 border-r-1 border-slate-100 bg-white p-8 transition-all duration-300 md:w-48 lg:w-64">
      <Link to={"/"}>
        <div className="flex justify-center">
          <img src={logo} alt="logo" className="mb-4 w-20 lg:w-32" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <nav className="flex flex-col space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  "flex items-center justify-center rounded-lg p-1.5 text-base transition-all md:justify-start md:px-1 md:py-1.5 lg:px-3 lg:py-2",
                  isActive
                    ? "bg-accent text-secondary md:border-l-2 lg:border-l-3"
                    : "hover:bg-accent",
                )}
              >
                <span
                  className={clsx(
                    "text-xl md:text-base lg:text-xl",
                    isActive && "text-secondary",
                  )}
                >
                  {item.icon}
                </span>
                <span className="ml-2 hidden text-xs md:block md:text-xs lg:text-sm">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-accent border-t">
          <div className="flex flex-col items-start gap-y-1 md:gap-y-2">
            <div className="mt-2 hidden w-full cursor-default items-center px-2 md:flex lg:px-3">
              <User className="h-5 w-5 md:h-6 md:w-6 lg:h-6 lg:w-6" />
              <span className="ml-2 flex flex-col lg:ml-3">
                <span className="text-secondary line-clamp-1 text-xs md:text-xs lg:text-sm">
                  {me!.first_name} {me!.last_name}
                </span>
                <span className="line-clamp-1 text-xs md:text-xs lg:text-sm">
                  {me!.email}
                </span>
              </span>
            </div>

            <button
              onClick={() => logout()}
              className={clsx(
                "flex w-full items-center justify-center rounded-md p-1.5 text-sm transition-all md:justify-start md:px-1 md:py-1.5 lg:px-3 lg:py-2",
                "hover:bg-accent cursor-pointer",
              )}
              tabIndex={0}
            >
              <LogOut className="h-5 w-5 md:h-4 md:w-4 lg:h-5 lg:w-5" />
              <span className="ml-2 hidden text-xs md:block lg:ml-3 lg:text-sm">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default TrailSideBar;
