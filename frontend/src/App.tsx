import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import EmailVerification from "./pages/auth/EmailVerification";
import EmailPage from "./pages/auth/EmailPage";
import OrdersListPage from "./pages/auth/OrdersListPage";
import OrderDetailsPage from "./pages/auth/OrderDetailsPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email_verification" element={<EmailVerification />} />
        <Route path="/reset-password-request" element={<EmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
