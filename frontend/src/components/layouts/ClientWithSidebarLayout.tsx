import { ArrowRightLeft, BookOpen, ShoppingBag } from "lucide-react";
import { Outlet } from "react-router-dom";
import TrailSideBar from "../TrailSideBar";

const ClientWithSidebarLayout = () => {
  return (
    <div className="flex">
      <TrailSideBar navItems={navItems} />
      <main className="h-screen w-full flex-1 overflow-auto p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientWithSidebarLayout;

const navItems = [
  { to: "/transactions", label: "Transactions", icon: <ArrowRightLeft /> },
  { to: "/orders-history", label: "Orders History", icon: <ShoppingBag /> },
  { to: "/current-borrows", label: "Current Borrows", icon: <BookOpen /> },
];
