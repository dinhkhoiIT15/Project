import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchCartCount = async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await api.get("/cart");
      const count = res.data.cart_items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      setCartCount(count);
    } catch (err) {
      console.error("Error fetching cart count", err);
    }
  };

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
