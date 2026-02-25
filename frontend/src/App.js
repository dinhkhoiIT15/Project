import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import Home from "./pages/customer/Home";
import AdminLayout from "./components/layout/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageCategories from "./pages/admin/ManageCategories";
import ManageProducts from "./pages/admin/ManageProducts";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import ManageOrders from "./pages/admin/ManageOrders";
import Profile from "./pages/customer/Profile";
import ProductDetail from "./pages/customer/ProductDetail";
import Footer from "./components/layout/Footer";

// Component trung gian để xử lý logic hiển thị Footer
const AppContent = () => {
  const location = useLocation();
  // Kiểm tra xem có phải đường dẫn admin không
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-800 font-sans">
      <div className="flex-grow">
        <Routes>
          <Route
            path="/login"
            element={<Navigate to="/" state={{ openLogin: true }} replace />}
          />
          <Route
            path="/register"
            element={<Navigate to="/" state={{ openRegister: true }} replace />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="orders" element={<ManageOrders />} />
          </Route>
        </Routes>
      </div>
      {/* Chỉ hiển thị Footer nếu KHÔNG phải trang Admin */}
      {!isAdminPath && <Footer />}
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? (
    children
  ) : (
    <Navigate to="/" state={{ openLogin: true }} replace />
  );
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/" state={{ openLogin: true }} replace />;
  if (role !== "Admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
}

export default App;
