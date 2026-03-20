import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import api from "../../services/api"; // Đảm bảo đường dẫn import api đúng với cấu trúc thư mục của bạn

const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Effect fetch dữ liệu mỗi khi refreshKey thay đổi
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]);

  // Effect kết nối Socket.IO để lắng nghe các sự kiện realtime
  useEffect(() => {
    const socket = io("http://localhost:5000");

    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    socket.on("new_order_placed", handleRefresh);
    socket.on("order_status_changed", handleRefresh);
    socket.on("product_list_updated", handleRefresh);
    socket.on("user_list_updated", handleRefresh);
    socket.on("review_list_updated", handleRefresh);

    // Cleanup function để ngắt kết nối khi component bị unmount
    return () => socket.disconnect();
  }, []);

  return { data, loading };
};

export default useDashboard;