import clsx from "clsx";
import { LogOut, ShoppingCart, User } from "lucide-react";
import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo_without_sharshora.svg";
import { useLogout } from "../../hooks/auth/useLogout";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";

const Navbar = () => {
  const { logout } = useLogout();
  const { cartItems } = useGetCartItems();
  const cartItemsCount = useMemo(() => {
    if (!cartItems) return 0;
    let numOfCartItems = 0;

    cartItems.purchase_items.forEach((item) => {
      numOfCartItems += item.quantity;
    });
    cartItems.borrow_items.forEach((item) => {
      numOfCartItems += item.borrowing_weeks;
    });
    return numOfCartItems;
  }, [cartItems]);

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
              clsx("text-primary hover:text-secondary relative duration-200", {
                "text-secondary": isActive,
              })
            }
          >
            <ShoppingCart />
            {cartItemsCount > 0 && (
              <span className="bg-secondary absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                {cartItemsCount}
              </span>
            )}
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
