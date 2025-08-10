import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import ForgetPassword from "./pages/auth/ForgetPassword";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import BorrowBooks from "./pages/client/BorrowBooks";
import PurchaseBooks from "./pages/client/PurchaseBooks";
import Navbar from "./components/Navbar";
import OrdersListPage from "./pages/auth/OrdersListPage";
import OrderDetailsPage from "./pages/auth/OrderDetailsPage";
import Footer from "./pages/client/Footer";
import BookDetails from "./pages/client/BookDetails";


const App = () => {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                {" "}
                <Navbar />
                <Home />{" "}
                <Footer/>
              </>
            }
          />
          <Route path="/" element={<><Navbar/>< Home/></>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/orders" element={<OrdersListPage />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
           <Route path="/books/:id" element={<><Navbar/><BookDetails /><Footer/></>} />
          <Route
            path="/reset-password/:reset_token"
            element={<ResetPassword />}
          />
          <Route path="/borrow-books" element={<><Navbar/><BorrowBooks /><Footer/></>} /> 
          <Route path="/purchase-books" element={<><Navbar/><PurchaseBooks /><Footer/></>} /> 
          
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
