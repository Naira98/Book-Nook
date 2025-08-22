import clsx from "clsx";
import { LogOut, User } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/light-bg-logo.svg";
import { useGetMe } from "../../hooks/auth/useGetMe";
import { useLogout } from "../../hooks/auth/useLogout";

interface SidebarProps {
  navItems: { to: string; label: string; icon: ReactNode }[];
}

const Sidebar = ({ navItems }: SidebarProps) => {
  const { me } = useGetMe();
  const location = useLocation();
  const { logout } = useLogout();

  return (
    <aside className="flex h-screen w-16 flex-col justify-between bg-sky-950 text-white transition-all duration-300 md:w-48 lg:w-64">
      <div className="flex justify-center p-2 md:p-4 lg:p-6">
        <img src={logo} alt="logo" className="mb-4 w-20 md:mb-0 lg:w-32" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="mt-2 flex flex-col space-y-1 px-1 md:px-2 lg:px-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  "flex items-center justify-center rounded-lg p-1.5 text-base transition-all md:justify-start md:px-2 md:py-1.5 lg:px-3 lg:py-2",
                  isActive
                    ? "border-l-2 border-sky-200 text-white md:border-l-3"
                    : "text-white/80 hover:text-white",
                )}
              >
                <span
                  className={clsx(
                    "text-lg md:text-xl",
                    isActive && "text-sky-200",
                  )}
                >
                  {item.icon}
                </span>
                <span className="ml-2 hidden text-sm md:block lg:text-base">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-1 md:p-2 lg:p-4">
        <div className="border-t border-white/10 text-white/80">
          <div className="flex flex-col items-start gap-y-1 md:gap-y-2">
            <div className="mt-2 hidden w-full cursor-default items-center px-2 md:flex lg:px-3">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="ml-2 flex flex-col lg:ml-3">
                <span className="line-clamp-1 text-xs text-sky-200 md:text-sm">
                  {me!.first_name} {me!.last_name}
                </span>
                <span className="line-clamp-1 text-xs md:text-sm">
                  {me!.email}
                </span>
              </span>
            </div>

            <div
              className={clsx(
                "flex w-full items-center justify-center rounded-md p-1.5 text-sm transition-all md:justify-start md:px-2 md:py-1.5 lg:px-3 lg:py-2",
                "cursor-pointer text-white/80 hover:text-white",
              )}
              role="button"
              tabIndex={0}
              onClick={() => logout()}
            >
              <LogOut className="md:h-5 md:w-5" />
              <span className="ml-2 hidden text-xs md:block lg:ml-3 lg:text-sm">
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
