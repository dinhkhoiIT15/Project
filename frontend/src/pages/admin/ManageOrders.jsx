import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { Truck, Clock, User, DollarSign } from "lucide-react";
import { io } from "socket.io-client";
import Pagination from "../../components/common/Pagination"; // MỚI IMPORT

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // MỚI: State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // MỚI: State an toàn để trigger gọi lại API

  const { addToast } = useToast();

  const fetchAllOrders = async () => {
    try {
      const res = await api.get("/orders/all", {
        params: { page: currentPage }, // MỚI: Truyền số trang
      });
      setOrders(res.data.orders);
      setTotalPages(res.data.total_pages || 1); // MỚI: Lưu tổng số trang
    } catch (err) {
      addToast("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  // useEffect 1: Chuyên xử lý việc gọi API khi đổi trang hoặc có refreshKey mới
  useEffect(() => {
    fetchAllOrders();
  }, [currentPage, refreshKey]);

  // useEffect 2: Chuyên xử lý Socket (Chỉ chạy 1 lần duy nhất khi mở trang)
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
      setRefreshKey((prev) => prev + 1); // An toàn: Gọi fetchAllOrders gián tiếp thông qua refreshKey
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

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-8 pb-4 border-b border-[#d0d7de]">
        <Truck className="w-6 h-6 text-[#6e7781] mr-3" />
        <h1 className="text-2xl font-bold text-[#1f2328]">Customer Orders</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#d0d7de] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#f6f8fa] text-[#6e7781] text-[11px] uppercase font-bold border-b border-[#d0d7de]">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d0d7de]">
            {orders.map((order) => (
              <tr
                key={order.order_id}
                className="hover:bg-[#f6f8fa] transition-colors"
              >
                <td className="p-4 font-mono text-xs">
                  <Link
                    to={`/order/${order.order_id}`}
                    className="text-[#0969da] hover:underline font-bold"
                  >
                    #{order.order_id}
                  </Link>
                </td>{" "}
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1f2328]">
                      {order.customer_name}
                    </span>
                    <span className="text-[10px] text-[#6e7781] font-medium flex items-center">
                      <Clock size={10} className="mr-1" /> {order.order_date}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-black text-[#1f2328] text-sm">
                  ${order.total_amount.toFixed(2)}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      order.order_status === "completed"
                        ? "bg-[#dafbe1] text-[#1a7f37] border-[#bc8cff]/0"
                        : "bg-[#fff8c5] text-[#9a6700] border-[#bc8cff]/0"
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <select
                    value={order.order_status}
                    onChange={(e) =>
                      handleStatusUpdate(order.order_id, e.target.value)
                    }
                    className="text-xs font-bold border border-[#d0d7de] rounded bg-[#f6f8fa] px-2 py-1 outline-none focus:border-[#0969da] cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipping">Shipping</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MỚI: Component Phân trang */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ManageOrders;
