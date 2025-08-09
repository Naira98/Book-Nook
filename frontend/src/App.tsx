import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import RoleBasedRoute from "./components/authorization/RoleBasedRoute";
import EmployeeLayout from "./components/staff/EmployeeLayout";
import Home from "./pages/Home";
import ForgetPassword from "./pages/auth/ForgetPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import OrderPage from "./pages/courier/OrdersPage";
import BooksTablePage from "./pages/employee/BooksTablePage";
// import GuestOnlyRoute from "./components/authorization/GuestOnlyRoute";
import Navbar from "./components/Navbar";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import BorrowBooks from "./pages/client/BorrowBooks";
import PurchaseBooks from "./pages/client/PurchaseBooks";
import CreateBookPage from "./pages/employee/CreateBookPage";
import { UserRole } from "./types/User";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Routes>
          {/* GUEST-only routes */}
          {/* <Route element={<GuestOnlyRoute />}> */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route
            path="/reset-password/:reset_token"
            element={<ResetPassword />}
          />
          <Route
            path="/borrow-books"
            element={
              <>
                <Navbar />
                <BorrowBooks />
              </>
            }
          />
          <Route
            path="/purchase-books"
            element={
              <>
                <Navbar />
                <PurchaseBooks />
              </>
            }
          />
          {/* </Route> */}

          {/* CLIENT-only routes */}
          {/* <Route element={<RoleBasedRoute allowedRoles={[UserRole.CLIENT]} />}> */}
          <Route path="/" element={<Home />} />
          {/* </Route> */}

          {/* EMPLOYEE-only routes */}
          <Route
            element={<RoleBasedRoute allowedRoles={[UserRole.EMPLOYEE]} />}
          >
            <Route element={<EmployeeLayout />}>
              <Route path="/employee/books" element={<BooksTablePage />} />
              <Route
                path="/employee/add-book"
                element={<CreateBookPage />}
              />
            </Route>
          </Route>

          {/* COURIER-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={[UserRole.COURIER]} />}>
            <Route path="/courier/orders" element={<OrderPage />} />
          </Route>

          {/* MANAGER-only routes */}
          <Route
            element={<RoleBasedRoute allowedRoles={[UserRole.MANAGER]} />}
          ></Route>

          {/* Unauthorized route */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Notfound route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
