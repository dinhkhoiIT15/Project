import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
} from "lucide-react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { io } from "socket.io-client"; // MỚI IMPORT
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Label, // MỚI: Import thêm Label để chèn text vào giữa
} from "recharts";

const COLORS = ["#0969da", "#1a7f37", "#bf3989", "#cf222e", "#8250df"];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // MỚI: Kích hoạt gọi lại API an toàn

  // Lắng nghe thay đổi refreshKey để gọi API
  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  // MỚI: Lắng nghe toàn bộ sự kiện Socket của hệ thống E-commerce
  useEffect(() => {
    const socket = io("http://localhost:5000");

    const handleRefresh = () => {
      setRefreshKey((prev) => prev + 1);
    };

    // Lắng nghe các thay đổi từ mọi nơi
    socket.on("new_order_placed", handleRefresh); // Khách đặt hàng mới
    socket.on("order_status_changed", handleRefresh); // Đổi trạng thái đơn hàng (nhảy biểu đồ)
    socket.on("product_list_updated", handleRefresh); // Kho hàng thay đổi
    socket.on("user_list_updated", handleRefresh); // Có khách đăng ký mới
    socket.on("review_list_updated", handleRefresh); // Review rác mới được gửi

    return () => socket.disconnect();
  }, []);

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

  if (loading)
    return (
      <div className="p-8 text-center text-[#6e7781] animate-pulse font-bold">
        Loading system analytics...
      </div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-[#cf222e] font-bold">
        Failed to load dashboard data.
      </div>
    );

  const stats = [
    {
      title: "Total Revenue",
      value: `$${data.kpi.revenue.toLocaleString()}`,
      icon: <DollarSign size={20} />,
      color: "text-[#1a7f37]",
      bg: "bg-[#dafbe1]",
    },
    {
      title: "Total Orders",
      value: data.kpi.orders,
      icon: <ShoppingCart size={20} />,
      color: "text-[#0969da]",
      bg: "bg-[#ddf4ff]",
    },
    {
      title: "Products",
      value: data.kpi.products,
      icon: <Package size={20} />,
      color: "text-[#8250df]",
      bg: "bg-[#f5f0ff]",
    },
    {
      title: "Total Customers", // Đổi tên cho chuẩn nghĩa
      value: data.kpi.customers,
      icon: <Users size={20} />,
      color: "text-[#bf3989]",
      bg: "bg-[#fff0f7]",
      // MỚI: Bổ sung element giao diện cho Active/Locked
      extra: (
        <div className="flex gap-2 mt-1.5 text-[10px] font-bold">
          <span className="text-[#1a7f37] bg-[#dafbe1] px-1.5 py-0.5 rounded">
            Active: {data.kpi.active_customers || 0}
          </span>
          <span className="text-[#cf222e] bg-[#ffebe9] px-1.5 py-0.5 rounded">
            Locked: {data.kpi.locked_customers || 0}
          </span>
        </div>
      ),
    },
  ];

  // MỚI: Tính toán tỷ lệ phần trăm đơn hàng Completed
  const totalStatusOrders = data.charts.order_status.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const completedItem = data.charts.order_status.find(
    (item) => item.name === "Completed",
  );
  const completedPercentage =
    totalStatusOrders > 0
      ? Math.round(((completedItem?.value || 0) / totalStatusOrders) * 100)
      : 0;

  return (
    <div className="animate-fade-in pb-10">
      <h1 className="text-2xl font-bold text-[#1f2328] mb-8">
        System Dashboard
      </h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-lg border border-[#d0d7de] flex items-center shadow-sm hover:border-[#0969da] transition-colors"
          >
            <div className={`p-3 rounded-md ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#6e7781] uppercase tracking-wider">
                {stat.title}
              </p>
              <h3 className="text-xl font-black text-[#1f2328]">
                {stat.value}
              </h3>
              {/* MỚI: Hiển thị thêm chi tiết (nếu có) */}
              {stat.extra && stat.extra}
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Doanh thu 7 ngày */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#d0d7de] shadow-sm">
          <h3 className="text-sm font-bold text-[#1f2328] mb-6">
            Revenue Trend (Last 7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.charts.revenue}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eaecef"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6e7781" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6e7781" }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #d0d7de",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#0969da" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0969da"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0969da", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trạng thái đơn hàng */}
        <div className="bg-white p-6 rounded-xl border border-[#d0d7de] shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#1f2328] mb-2">
            Order Status Distribution
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.charts.order_status}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.charts.order_status.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                  {/* MỚI: Chèn nội dung text vào chính giữa tâm của biểu đồ */}
                  <Label
                    content={({ viewBox: { cx, cy } }) => {
                      // Đảm bảo Recharts đã tính toán xong tọa độ
                      if (!cx || !cy) return null;
                      return (
                        <g>
                          <text
                            x={cx}
                            y={cy - 2}
                            textAnchor="middle"
                            dominantBaseline="bottom"
                            fontSize="28"
                            fontWeight="900"
                            fill="#1a7f37"
                          >
                            {completedPercentage}%
                          </text>
                          <text
                            x={cx}
                            y={cy + 16}
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#6e7781"
                            className="uppercase tracking-widest"
                          >
                            COMPLETED
                          </text>
                        </g>
                      );
                    }}
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", fontWeight: "600" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ALERTS & LISTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Đơn hàng cần duyệt */}
        <div className="bg-white border border-[#d0d7de] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#f6f8fa] px-4 py-3 border-b border-[#d0d7de] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1f2328] flex items-center gap-2">
              <Clock size={16} className="text-[#9a6700]" /> Pending Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#0969da] hover:underline"
            >
              View All
            </Link>
          </div>
          <ul className="divide-y divide-[#d0d7de]">
            {data.alerts.pending_orders.length === 0 ? (
              <li className="p-8 text-sm text-[#6e7781] text-center font-medium">
                No pending orders.
              </li>
            ) : (
              data.alerts.pending_orders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 flex justify-between items-center hover:bg-[#f6f8fa] transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-[#1f2328]">
                      Order #{order.id}
                    </p>
                    <p className="text-xs font-medium text-[#6e7781] mt-0.5">
                      {order.date}
                    </p>
                  </div>
                  <span className="text-sm font-black text-[#1a7f37]">
                    ${order.amount.toFixed(2)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Sản phẩm sắp hết */}
        <div className="bg-white border border-[#d0d7de] rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#f6f8fa] px-4 py-3 border-b border-[#d0d7de] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1f2328] flex items-center gap-2">
              <Package size={16} className="text-[#cf222e]" /> Low Stock Alerts
            </h3>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-[#0969da] hover:underline"
            >
              Manage
            </Link>
          </div>
          <ul className="divide-y divide-[#d0d7de]">
            {data.alerts.low_stock.length === 0 ? (
              <li className="p-8 text-sm text-[#6e7781] text-center font-medium">
                Inventory looks good.
              </li>
            ) : (
              data.alerts.low_stock.map((item) => (
                <li
                  key={item.id}
                  className="p-4 flex justify-between items-center hover:bg-[#f6f8fa] transition-colors"
                >
                  <p className="text-sm font-bold text-[#1f2328] truncate pr-4">
                    {item.name}
                  </p>
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-[#ffebe9] text-[#cf222e] rounded-md whitespace-nowrap">
                    {item.stock} left
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Cảnh báo AI (Đánh giá Fake) */}
        <div className="bg-white border border-[#cf222e]/30 rounded-xl shadow-sm overflow-hidden flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-[#ffebe9] rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-[#cf222e]" />
          </div>
          <h3 className="text-lg font-black text-[#1f2328] mb-1">
            AI Review Alerts
          </h3>
          <p className="text-[13px] text-[#6e7781] mb-6 font-medium px-4">
            Reviews flagged as fake, spam, or toxic by AI system.
          </p>
          <div className="text-5xl font-black text-[#cf222e] mb-6">
            {data.alerts.fake_reviews}
          </div>
          <Link
            to="/admin/reviews"
            className="px-6 py-2.5 bg-[#cf222e] text-white text-sm font-bold rounded-md hover:bg-[#a40e26] transition-colors w-full sm:w-auto"
          >
            Review Queue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
