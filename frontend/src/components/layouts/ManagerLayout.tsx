import {
  ChartNoAxesCombined,
  LibraryBig,
  Package,
  Settings,
  Tag,
  UsersRound,
} from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const navItems = [
  {
    to: "/manager/dashboard",
    label: "Dashboard",
    icon: <ChartNoAxesCombined />,
  },
  { to: "/staff/books", label: "Books", icon: <LibraryBig /> },
  { to: "/staff/orders", label: "Orders", icon: <Package /> },
  { to: "/manager/promo-codes", label: "Promo Codes", icon: <Tag /> },
  { to: "/manager/users", label: "Users", icon: <UsersRound /> },
  { to: "/manager/settings", label: "Settings", icon: <Settings /> },
];

const ManagerLayout = () => {
  return (
    <div className="flex">
      <Sidebar navItems={navItems} />
      <main className="h-screen w-full flex-1 overflow-auto p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
