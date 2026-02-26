import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = async () => {
    // Nếu chưa đăng nhập thì mặc định là 0
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      // Tính tổng số lượng (quantity) của tất cả các món trong giỏ
      const count = res.data.cart_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(count);
    } catch (err) {
      console.error("Error fetching cart count", err);
    }
  };

  // Tự động lấy số lượng khi người dùng đăng nhập thành công hoặc load lại trang
  useEffect(() => {
    fetchCartCount();
  }, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
