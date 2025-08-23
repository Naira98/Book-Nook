import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import GuestOnlyRoute from "./components/authorization/GuestOnlyRoute";
import RoleBasedRoute from "./components/authorization/RoleBasedRoute";
import CourierLayout from "./components/courier/CourierLayout";
import ClientWithNavbarLayout from "./components/layouts/ClientWithNavbarLayout";
import ClientWithSidebarLayout from "./components/layouts/ClientWithSidebarLayout";
import ManagerLayout from "./components/layouts/ManagerLayout";
import EmployeeLayout from "./components/staff/EmployeeLayout";
import { useGetMe } from "./hooks/auth/useGetMe";
import ForgetPassword from "./pages/auth/ForgetPassword";
import Login from "./pages/auth/Login";
import OrdersListPage from "./pages/auth/OrdersListPage";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import BorrowBooksPage from "./pages/client/BorrowBooksPage";
import BorrowDetailsPage from "./pages/client/BorrowDetailsPage";
import CartPage from "./pages/client/CartPage";
import ChechoutPage from "./pages/client/CheckoutPage";
import CheckoutSuccess from "./pages/client/CheckoutSuccess";
import ClientOrderDetailsPage from "./pages/client/ClientOrderDetailsPage";
import ClientReturnOrderDetailsPage from "./pages/client/ClientReturnOrderDetailsPage";
import CurrentBorrowsPage from "./pages/client/CurrentBorrowsPage";
import HomePage from "./pages/client/HomePage";
import Interests from "./pages/client/Interests";
import OrdersPage from "./pages/client/OrdersPage";
import PurchaseBooksPage from "./pages/client/PurchaseBooksPage";
import PurchaseDetailsPage from "./pages/client/PurchaseDetailsPage";
import TransactionsPage from "./pages/client/TransactionsPage";
import CourierOrderDetailsPage from "./pages/courier/CourierOrderDetailsPage";
import CourierOrdersPage from "./pages/courier/CourierOrdersPage";
import CourierReturnOrderDetailsPage from "./pages/courier/CourierRetrunOrderDetailsPage";
import AddAuthorPage from "./pages/employee/AddAuthorPage";
import AddBookPage from "./pages/employee/AddBookPage";
import AddCategoryPage from "./pages/employee/AddCategoryPage";
import BooksTablePage from "./pages/employee/BooksTablePage";
import CreatePromoCodePage from "./pages/employee/CreatePromoCodePage";
import EmployeeOrderDetailsPage from "./pages/employee/EmployeeOrderDetailsPage";
import EmployeeOrdersPage from "./pages/employee/EmployeeOrdersPage";
import EmployeeReturnOrderDetailsPage from "./pages/employee/EmployeeRetrunOrderDetailsPage";
import PromoCodesPage from "./pages/employee/PromoCodesPage";
import UpdateBookPage from "./pages/employee/UpdateBookPage";
import AddNewUser from "./pages/manager/addNewUser";
import UsersList from "./pages/manager/listallUser";
import ManagerDashboardPage from "./pages/manager/ManagerDashboardPage";
import ManagerSettingsPage from "./pages/manager/ManagerSettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { UserRole } from "./types/User";

const App = () => {
  const { me } = useGetMe();

  return (
    <>
      <Routes>
        {/* GUEST-only routes */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />

          <Route
            path="/reset-password/:reset_token"
            element={<ResetPassword />}
          />
        </Route>

        {/* CLIENT-only routes */}
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.CLIENT]} />}>
          {/* Client pages with navbar */}
          <Route path="/interests" element={<Interests />} />
          <Route path="/" element={<ClientWithNavbarLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/borrow-books" element={<BorrowBooksPage />} />
            <Route path="/purchase-books" element={<PurchaseBooksPage />} />
            <Route
              path="/details/borrow/:bookDetailsId"
              element={<BorrowDetailsPage />}
            />
            <Route
              path="/details/purchase/:bookDetailsId"
              element={<PurchaseDetailsPage />}
            />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<ChechoutPage />} />
          </Route>

          {/* Client pages with sidebar */}
          <Route path="/" element={<ClientWithSidebarLayout />}>
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/orders-history" element={<OrdersPage />} />
            <Route path="/current-borrows" element={<CurrentBorrowsPage />} />
            <Route
              path="/orders-history/order/:orderId"
              element={<ClientOrderDetailsPage />}
            />
            <Route
              path="/orders-history/return-order/:returnOrderId"
              element={<ClientReturnOrderDetailsPage />}
            />
          </Route>

          <Route path="/transaction-success" element={<CheckoutSuccess />} />
        </Route>

        {/* EMPLOYEE and MANAGER routes */}
        <Route
          element={
            <RoleBasedRoute
              allowedRoles={[UserRole.EMPLOYEE, UserRole.MANAGER]}
            />
          }
        >
          <Route
            element={
              me?.role === UserRole.EMPLOYEE ? (
                <EmployeeLayout />
              ) : (
                <ManagerLayout />
              )
            }
          >
            <Route path="/staff/books" element={<BooksTablePage />} />
            <Route path="/staff/books/create-book" element={<AddBookPage />} />
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
            <Route path="/staff/orders" element={<EmployeeOrdersPage />} />
            <Route
              path="/staff/order/:orderId"
              element={<EmployeeOrderDetailsPage />}
            />
            <Route
              path="/staff/return-order/:orderId"
              element={<EmployeeReturnOrderDetailsPage />}
            />
          </Route>
        </Route>

        {/* COURIER-only routes */}
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.COURIER]} />}>
          <Route element={<CourierLayout />}>
            <Route path="/courier/orders" element={<CourierOrdersPage />} />
            <Route
              path="/courier/order/:orderId"
              element={<CourierOrderDetailsPage />}
            />
            <Route
              path="/courier/return-order/:orderId"
              element={<CourierReturnOrderDetailsPage />}
            />
            <Route path="/orders" element={<OrdersListPage />} />
          </Route>
        </Route>

        {/* MANAGER-only routes */}
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.MANAGER]} />}>
          <Route element={<ManagerLayout />}>
            <Route
              path="/manager/dashboard"
              element={<ManagerDashboardPage />}
            />
            <Route path="/manager/promo-codes" element={<PromoCodesPage />} />
            <Route
              path="/manager/promo-codes/create"
              element={<CreatePromoCodePage />}
            />
            <Route path="/manager/settings" element={<ManagerSettingsPage />} />
            <Route path="manager/users/add-new-user" element={<AddNewUser />} />
            <Route
              path="manager/users/list-all-users"
              element={<UsersList />}
            />
          </Route>
        </Route>

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
    </>
  );
};

export default App;
