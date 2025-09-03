import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useGetMe } from "./hooks/auth/useGetMe";
import { UserRole } from "./types/User";

// Lazy load components
const GuestOnlyRoute = lazy(
  () => import("./components/authorization/GuestOnlyRoute"),
);
const RoleBasedRoute = lazy(
  () => import("./components/authorization/RoleBasedRoute"),
);
const CourierLayout = lazy(() => import("./components/courier/CourierLayout"));
const ClientWithNavbarLayout = lazy(
  () => import("./components/layouts/ClientWithNavbarLayout"),
);
const ClientWithSidebarLayout = lazy(
  () => import("./components/layouts/ClientWithSidebarLayout"),
);
const ManagerLayout = lazy(() => import("./components/layouts/ManagerLayout"));
const EmployeeLayout = lazy(() => import("./components/staff/EmployeeLayout"));

// Lazy load auth pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgetPasswordPage = lazy(
  () => import("./pages/auth/ForgetPasswordPage"),
);
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const EmailVerificationPage = lazy(
  () => import("./pages/auth/EmailVerificationPage"),
);

// Lazy load client pages
const HomePage = lazy(() => import("./pages/client/HomePage"));
const BorrowBooksPage = lazy(() => import("./pages/client/BorrowBooksPage"));
const BorrowDetailsPage = lazy(
  () => import("./pages/client/BorrowDetailsPage"),
);
const CartPage = lazy(() => import("./pages/client/CartPage"));
const ChechoutPage = lazy(() => import("./pages/client/CheckoutPage"));
const CheckoutSuccessPage = lazy(
  () => import("./pages/client/CheckoutSuccessPage"),
);
const ClientOrderDetailsPage = lazy(
  () => import("./pages/client/ClientOrderDetailsPage"),
);
const ClientReturnOrderDetailsPage = lazy(
  () => import("./pages/client/ClientReturnOrderDetailsPage"),
);
const CurrentBorrowsPage = lazy(
  () => import("./pages/client/CurrentBorrowsPage"),
);
const InterestsPage = lazy(() => import("./pages/client/InterestsPage"));
const OrdersPage = lazy(() => import("./pages/client/OrdersPage"));
const PurchaseBooksPage = lazy(
  () => import("./pages/client/PurchaseBooksPage"),
);
const PurchaseDetailsPage = lazy(
  () => import("./pages/client/PurchaseDetailsPage"),
);
const TransactionsPage = lazy(() => import("./pages/client/TransactionsPage"));

// Lazy load courier pages
const CourierOrderDetailsPage = lazy(
  () => import("./pages/courier/CourierOrderDetailsPage"),
);
const CourierOrdersPage = lazy(
  () => import("./pages/courier/CourierOrdersPage"),
);
const CourierReturnOrderDetailsPage = lazy(
  () => import("./pages/courier/CourierRetrunOrderDetailsPage"),
);

// Lazy load employee pages
const AddAuthorPage = lazy(() => import("./pages/employee/AddAuthorPage"));
const AddBookPage = lazy(() => import("./pages/employee/AddBookPage"));
const AddCategoryPage = lazy(() => import("./pages/employee/AddCategoryPage"));
const BooksTablePage = lazy(() => import("./pages/employee/BooksTablePage"));
const CreatePromoCodePage = lazy(
  () => import("./pages/employee/CreatePromoCodePage"),
);
const EmployeeOrderDetailsPage = lazy(
  () => import("./pages/employee/EmployeeOrderDetailsPage"),
);
const EmployeeOrdersPage = lazy(
  () => import("./pages/employee/EmployeeOrdersPage"),
);
const EmployeeReturnOrderDetailsPage = lazy(
  () => import("./pages/employee/EmployeeRetrunOrderDetailsPage"),
);
const PromoCodesPage = lazy(() => import("./pages/employee/PromoCodesPage"));
const UpdateBookPage = lazy(() => import("./pages/employee/UpdateBookPage"));

// Lazy load manager pages
const AddNewUserPage = lazy(() => import("./pages/manager/addNewUserPage"));
const UsersListPage = lazy(() => import("./pages/manager/UsersListPage"));
const ManagerDashboardPage = lazy(
  () => import("./pages/manager/ManagerDashboardPage"),
);
const ManagerSettingsPage = lazy(
  () => import("./pages/manager/ManagerSettingsPage"),
);

// Lazy load error pages
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));

const App = () => {
  const { me } = useGetMe();

  return (
    <>
      <Routes>
        {/* GUEST-only routes */}
        <Route element={<GuestOnlyRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/forget-password" element={<ForgetPasswordPage />} />
          <Route
            path="/reset-password/:reset_token"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* CLIENT-only routes */}
        <Route element={<RoleBasedRoute allowedRoles={[UserRole.CLIENT]} />}>
          <Route path="/interests" element={<InterestsPage />} />

          {/* Client pages with navbar */}
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
            <Route
              path="/orders-history/order/:orderId"
              element={<ClientOrderDetailsPage />}
            />
            <Route
              path="/orders-history/return-order/:returnOrderId"
              element={<ClientReturnOrderDetailsPage />}
            />
            <Route path="/current-borrows" element={<CurrentBorrowsPage />} />
          </Route>

          <Route
            path="/transaction-success"
            element={<CheckoutSuccessPage />}
          />
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
            <Route
              path="manager/users/add-new-user"
              element={<AddNewUserPage />}
            />
            <Route
              path="manager/users/list-all-users"
              element={<UsersListPage />}
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
