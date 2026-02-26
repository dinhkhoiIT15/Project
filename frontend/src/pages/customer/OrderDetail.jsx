import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { io } from "socket.io-client"; // MỚI IMPORT
import api from "../../services/api";
import { Clock, MapPin, CreditCard, Package, ArrowLeft } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const OrderDetail = () => {
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

  // MỚI: Lắng nghe Real-time cho riêng đơn hàng này
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("order_status_changed", (data) => {
      setOrder((prevOrder) => {
        // Chỉ cập nhật nếu sự kiện bắn về khớp với mã đơn hàng đang xem
        if (prevOrder && prevOrder.order_id === data.order_id) {
          return {
            ...prevOrder,
            order_status: data.new_status,
            payment_status: data.payment_status,
          };
        }
        return prevOrder;
      });
    });

    return () => socket.disconnect();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="text-center py-20 font-bold text-[#6e7781]">
          Loading order details...
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="text-center py-20 font-bold text-[#cf222e]">
          Order not found or access denied.
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans text-[#1f2328]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item to="/my-orders">Order History</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Order #{order.order_id}</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex items-center justify-between mt-6 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 border border-[#d0d7de] rounded-md hover:bg-[#f6f8fa] transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-black">Order #{order.order_id}</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                order.order_status === "completed"
                  ? "bg-[#dafbe1] text-[#1a7f37] border-[#1a7f37]/20"
                  : order.order_status === "cancelled"
                    ? "bg-[#ffebe9] text-[#cf222e] border-[#cf222e]/20"
                    : "bg-[#fff8c5] text-[#9a6700] border-[#9a6700]/20"
              }`}
            >
              {order.order_status}
            </span>
          </div>
          <span className="text-sm font-bold text-[#6e7781] flex items-center gap-1">
            <Clock size={14} /> {order.order_date}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#f6f8fa] p-5 rounded-lg border border-[#d0d7de] md:col-span-2">
            <h3 className="font-bold text-sm text-[#6e7781] uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin size={16} /> Shipping Address
            </h3>
            <p className="font-medium text-[15px] leading-relaxed">
              {order.shipping_address}
            </p>
          </div>
          <div className="bg-[#f6f8fa] p-5 rounded-lg border border-[#d0d7de]">
            <h3 className="font-bold text-sm text-[#6e7781] uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={16} /> Payment
            </h3>
            <p className="font-medium text-[15px] mb-1">
              Method: {order.payment_method || "COD"}
            </p>
            <p className="font-medium text-[15px]">
              Status:{" "}
              <span className="capitalize text-[#0969da]">
                {order.payment_status}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#d0d7de] rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 bg-[#f6f8fa] border-b border-[#d0d7de] flex items-center gap-2">
            <Package className="text-[#6e7781]" size={18} />
            <h3 className="font-bold text-[15px]">Order Items</h3>
          </div>
          <div className="divide-y divide-[#f0f2f4]">
            {order.items.map((item) => (
              <div
                key={item.product_id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f6f8fa]/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white border border-[#d0d7de] rounded flex items-center justify-center overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="text-[#afb8c1]" size={24} />
                    )}
                  </div>
                  <div>
                    <Link
                      to={`/product/${item.product_id}`}
                      className="font-bold text-[15px] hover:text-[#0969da] hover:underline"
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-[#6e7781] mt-1">
                      Qty:{" "}
                      <span className="font-bold text-[#1f2328]">
                        {item.quantity}
                      </span>{" "}
                      × ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.order_status === "completed" && (
                  <button
                    onClick={() => navigate(`/product/${item.product_id}`)}
                    className="flex items-center justify-center gap-1.5 text-[#0969da] hover:bg-[#0969da]/5 px-4 py-2 rounded-md text-sm font-bold transition-all border border-[#0969da]/20 shrink-0"
                  >
                    Write Review
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-5 bg-[#f6f8fa] border-t border-[#d0d7de] flex justify-between items-center">
            <span className="font-bold text-[#6e7781]">Total Amount</span>
            <span className="text-2xl font-black text-[#1f2328]">
              ${order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetail;
