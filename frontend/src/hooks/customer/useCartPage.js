import { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";

const useCartPage = () => {
  const [cart, setCart] = useState({ cart_items: [], total_price: 0 });
  const [loading, setLoading] = useState(true);
  
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
      fetchCartCount();
    } catch (err) {
      addToast("Failed to load your cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      fetchCart();
      addToast("Cart updated successfully!", "success");
    } catch (err) {
      addToast("Failed to update quantity", "error");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
      addToast("Item has been removed from your cart", "info");
    } catch (err) {
      addToast("Failed to remove item", "error");
    }
  };

  return {
    cart,
    loading,
    handleUpdateQty,
    handleRemove,
  };
};

export default useCartPage;