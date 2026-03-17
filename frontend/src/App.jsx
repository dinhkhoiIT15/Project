import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate, // MỚI: Thêm useNavigate
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
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
import MyReviews from "./pages/customer/MyReviews";
import ManageReviews from "./pages/admin/ManageReviews";
import OrderDetail from "./pages/customer/OrderDetail";
import ManageUsers from "./pages/admin/ManageUsers";

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith("/admin");

  const { loading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      user?.role === "Admin" &&
      location.pathname === "/"
    ) {
      navigate("/admin", { replace: true });
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-[#6e7781]">
        Verifying Session...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-800 font-sans">
      <div className="flex-grow">
        <Routes>
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
            path="/order/:id"
            element={
              <PrivateRoute>
                <OrderDetail />
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
            path="/my-reviews"
            element={
              <PrivateRoute>
                <MyReviews />
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
            <Route path="reviews" element={<ManageReviews />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </div>
      {!isAdminPath && <Footer />}
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" state={{ openLogin: true }} replace />
  );
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated)
    return <Navigate to="/" state={{ openLogin: true }} replace />;
  if (user?.role !== "Admin") return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
