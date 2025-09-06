import clsx from "clsx";
import { LogOut, ShoppingCart, User } from "lucide-react";
import { useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo_without_sharshora.svg";
import { useLogout } from "../../hooks/auth/useLogout";
import { useGetCartItems } from "../../hooks/cart/useGetCartItems";
import NotificationsMenu from "../client/NotificationsMenu";
import FullScreenSpinner from "../shared/FullScreenSpinner";

const Navbar = () => {
  const { logout } = useLogout();
  const { cartItems, isPending: isCartPending } = useGetCartItems();

  const cartItemsCount = useMemo(() => {
    if (!cartItems) return 0;
    let numOfCartItems = 0;

    cartItems.purchase_items.forEach((item) => {
      numOfCartItems += item.quantity;
    });
    numOfCartItems += cartItems.borrow_items.length;
    return numOfCartItems;
  }, [cartItems]);

  if (isCartPending) return <FullScreenSpinner />;

  return (
    <nav className="border-accent sticky top-0 z-40 border-b bg-white py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/">
          <img src={logo} alt="logo" className="w-20" />
        </Link>
        <div className="flex items-center gap-6">
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

          <div className="flex items-center gap-5">
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                clsx(
                  "text-primary hover:text-secondary relative flex h-9 w-9 items-center justify-center duration-200",
                  {
                    "text-secondary": isActive,
                  },
                )
              }
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="bg-secondary absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs text-white">
                  {cartItemsCount}
                </span>
              )}
            </NavLink>

            <NotificationsMenu />

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                clsx(
                  "text-primary hover:text-secondary flex h-9 w-9 items-center justify-center duration-200",
                  {
                    "text-secondary": isActive,
                  },
                )
              }
            >
              <User className="h-6 w-6" />
            </NavLink>
            <button
              onClick={() => logout()}
              className="text-primary hover:text-secondary flex h-9 w-9 cursor-pointer items-center justify-center duration-200"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
