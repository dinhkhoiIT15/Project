import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const useManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const { addToast } = useToast();

  const fetchAllOrders = async () => {
    try {
      const res = await api.get("/orders/all", {
        params: { page: currentPage },
      });
      setOrders(res.data.orders);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      addToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [currentPage, refreshKey]);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("order_status_changed", (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === data.order_id
            ? {
                ...order,
                order_status: data.new_status,
                payment_status: data.payment_status,
              }
            : order,
        ),
      );
    });

    socket.on("new_order_placed", () => {
      addToast("🛎️ New order received! Updating list...", "info");
      setRefreshKey((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { order_status: status });
      addToast(`Order #${id} updated to ${status}`, "success");
      fetchAllOrders();
    } catch (err) {
      addToast("Update failed", "error");
    }
  };

  return {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    handleStatusUpdate,
  };
};

export default useManageOrders;