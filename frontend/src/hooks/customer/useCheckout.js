import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";

const useCheckout = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();
  
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.data.user.address) setAddress(res.data.user.address);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!placedOrderId) return;

    const socket = io("http://localhost:5000");

    socket.on("order_status_changed", (data) => {
      if (data.order_id === placedOrderId) {
        setOrderStatus(data.new_status);
        if (data.new_status !== "pending" && data.new_status !== "cancelled") {
          addToast(
            `Shop has updated your order to: ${data.new_status}`,
            "info",
          );
        }
      }
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedOrderId]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address) {
      addToast("Shipping address is required!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/orders/checkout", {
        shipping_address: address,
        payment_method: "COD",
      });

      addToast("Order placed! Waiting for shop confirmation.", "success");
      fetchCartCount();

      setPlacedOrderId(res.data.order_id);
      setOrderStatus("pending");
      setCountdown(60);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Order failed. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUserCancel = async () => {
    try {
      await api.put(`/orders/${placedOrderId}/cancel`);
      addToast("Order cancelled. Items returned to your cart.", "info");
      setOrderStatus("cancelled");
      fetchCartCount(); 

      setTimeout(() => navigate("/cart"), 2000);
    } catch (err) {
      addToast(
        "Cannot cancel order. Shop might have already confirmed it.",
        "error",
      );
    }
  };

  return {
    address,
    setAddress,
    loading,
    placedOrderId,
    orderStatus,
    countdown,
    handleCheckout,
    handleUserCancel,
    navigate,
  };
};

export default useCheckout;