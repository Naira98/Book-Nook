import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { LibraryBig, Package } from "lucide-react";

const navItems = [
  { to: "/employee/books", label: "Books", icon: <LibraryBig /> },
  { to: "/employee/orders", label: "Orders", icon: <Package /> },
];

const EmployeeLayout = () => {
  return (
    <div className="flex">
      <Sidebar navItems={navItems} />
      <main className="h-screen flex-1 overflow-auto bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
