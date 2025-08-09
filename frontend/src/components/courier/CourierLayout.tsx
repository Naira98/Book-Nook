import { Outlet } from "react-router-dom";
import CourierNavbar from "./CourierNavbar";

const CourierLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CourierNavbar />
      <Outlet />
    </div>
  );
};

export default CourierLayout;
