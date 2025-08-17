import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Navbar from "./components/Navbar";
import GuestOnlyRoute from "./components/authorization/GuestOnlyRoute";
import RoleBasedRoute from "./components/authorization/RoleBasedRoute";
import CourierLayout from "./components/courier/CourierLayout";
import EmployeeLayout from "./components/staff/EmployeeLayout";
import Home from "./pages/Home";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import ForgetPassword from "./pages/auth/ForgetPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import BorrowBooks from "./pages/client/BorrowBooks";
import PurchaseBooks from "./pages/client/PurchaseBooks";
import CartPage from "./pages/client/CartPage";
import OrderPage from "./pages/courier/OrdersPage";
import AddAuthorPage from "./pages/employee/AddAuthorPage";
import AddBookPage from "./pages/employee/AddBookPage";
import AddCategoryPage from "./pages/employee/AddCategoryPage";
import BooksTablePage from "./pages/employee/BooksTablePage";
import UpdateBookPage from "./pages/employee/UpdateBookPage";
import { UserRole } from "./types/User";
import ChechoutPage from "./pages/client/Checkout";
import Interests from "./pages/client/Interests";
import OrdersListPage from "./pages/auth/OrdersListPage";
import CheckoutSuccess from "./pages/client/CheckoutSuccess";
import Footer from "./pages/client/Footer";
import TransactionsPage from "./pages/client/TransactionsPage";

import CourierOrderDetailsPage from "./pages/courier/OrderDetailsPage";
import CourierReturnOrderDetailsPage from "./pages/courier/RetrunOrderDetailsPage";
import StaffOrdersPage from "./pages/employee/OrdersPage";
import EmployeeOrderDetailsPage from "./pages/employee/OrderDetailsPage";
import EmployeeReturnOrderDetailsPage from "./pages/employee/RetrunOrderDetailsPage";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Routes>
          {/* GUEST-only routes */}
          <Route element={<GuestOnlyRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/interests" element={<Interests />} />

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
          </Route>

          {/* CLIENT-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={[UserRole.CLIENT]} />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/borrow-books"
              element={
                <>
                  <Navbar />
                  <BorrowBooks />
                  <Footer />
                </>
              }
            />
            <Route
              path="/purchase-books"
              element={
                <>
                  <Navbar />
                  <PurchaseBooks />
                  <Footer />
                </>
              }
            />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/checkout-success" element={<CheckoutSuccess />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ChechoutPage />} />
          </Route>

          {/* EMPLOYEE-only routes */}
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={[UserRole.EMPLOYEE, UserRole.MANAGER]}
              />
            }
          >
            <Route element={<EmployeeLayout />}>
              <Route path="/staff/books" element={<BooksTablePage />} />
              <Route
                path="/staff/books/create-book"
                element={<AddBookPage />}
              />
              <Route
                path="/staff/books/create-author"
                element={<AddAuthorPage />}
              />
              <Route
                path="/staff/books/create-category"
                element={<AddCategoryPage />}
              />
              <Route
                path="/staff/books/update-book/:book_id"
                element={<UpdateBookPage />}
              />
              <Route path="/employee/orders" element={<StaffOrdersPage />} />
              <Route
                path="/employee/orders/:id"
                element={<EmployeeOrderDetailsPage />}
              />
              <Route
                path="/employee/return-orders/:id"
                element={<EmployeeReturnOrderDetailsPage />}
              />
            </Route>
          </Route>

          {/* COURIER-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={[UserRole.COURIER]} />}>
            <Route element={<CourierLayout />}>
              <Route path="/courier/orders" element={<OrderPage />} />
              <Route path="/order/:id" element={<CourierOrderDetailsPage />} />
              <Route
                path="/return-order/:id"
                element={<CourierReturnOrderDetailsPage />}
              />
              <Route path="/orders" element={<OrdersListPage />} />
            </Route>
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
