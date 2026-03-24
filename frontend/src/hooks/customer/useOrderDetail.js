import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";

const useOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    const socket = io("http://localhost:5000");

    socket.on("order_status_changed", (data) => {
      if (!isMounted) return;

      setOrder((prevOrder) => {
        if (prevOrder && String(prevOrder.order_id) === String(data.order_id)) {
          return {
            ...prevOrder,
            order_status: data.order_status,
            payment_status: data.payment_status,
          };
        }
        return prevOrder;
      });
    });

    return () => {
      isMounted = false;
      if (socket) socket.disconnect();
    };
  }, [id]);

  return {
    order,
    loading,
    navigate,
  };
};

export default useOrderDetail;