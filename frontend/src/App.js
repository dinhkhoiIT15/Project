import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastProvider } from "./context/ToastContext"; // MỚI IMPORT
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
import MockPaymentGateway from "./pages/customer/MockPaymentGateway";
import MoMoPayment from "./pages/customer/MoMoPayment";

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
      {" "}
      {/* BAO BỌC Ở ĐÂY */}
      <Router>
        <div className="min-h-screen bg-background text-gray-800 font-sans">
          <Routes>
            <Route
              path="/login"
              element={<Navigate to="/" state={{ openLogin: true }} replace />}
            />
            <Route
              path="/register"
              element={
                <Navigate to="/" state={{ openRegister: true }} replace />
              }
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
              path="/payment/:orderId"
              element={
                <PrivateRoute>
                  <MockPaymentGateway />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-momo/:orderId"
              element={
                <PrivateRoute>
                  <MoMoPayment />
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
      </Router>
    </ToastProvider>
  );
}

export default App;
