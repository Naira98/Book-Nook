import { LogOut, ShoppingCart, User } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo_without_sharshora.svg";
import { useLogout } from "../../hooks/auth/useLogout";
import clsx from "clsx";

const Navbar = () => {
  const { logout } = useLogout();

  return (
    <nav className="border-accent border-b-1 py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="logo" className="w-20" />
        </Link>
        <div className="flex gap-6">
          <NavLink
            to="/borrow-books"
            className={({ isActive }) =>
              clsx("text-primary hover:text-secondary duration-200", {
                "text-secondary": isActive,
              })
            }
          >
            Borrow Books
          </NavLink>
          <NavLink
            to="/purchase-books"
            className={({ isActive }) =>
              clsx("text-primary hover:text-secondary duration-200", {
                "text-secondary": isActive,
              })
            }
          >
            Purchase Books
          </NavLink>

          <NavLink
            to="/cart"
            className={({ isActive }) =>
              clsx("text-primary hover:text-secondary duration-200", {
                "text-secondary": isActive,
              })
            }
          >
            <ShoppingCart />
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              clsx("text-primary hover:text-secondary duration-200", {
                "text-secondary": isActive,
              })
            }
          >
            <User />
          </NavLink>
          <button
            onClick={() => logout()}
            className="text-primary hover:text-secondary cursor-pointer duration-200"
          >
            <LogOut />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
