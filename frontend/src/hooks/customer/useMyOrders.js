import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";

const useMyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/orders/my-orders?page=${currentPage}&per_page=5`,
      );
      setOrders(res.data.orders || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

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

    return () => socket.disconnect();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    navigate,
    getStatusStyle,
  };
};

export default useMyOrders;