import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "../../pages/client/Footer";

const ClientWithNavbarLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default ClientWithNavbarLayout;
