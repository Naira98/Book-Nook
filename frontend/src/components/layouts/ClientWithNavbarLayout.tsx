import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const ClientWithNavbarLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default ClientWithNavbarLayout;
