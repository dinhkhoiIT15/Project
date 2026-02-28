import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { io } from "socket.io-client";
import api from "../../services/api";
import { ClipboardList, Clock, Package, Star } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import Pagination from "../../components/common/Pagination";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 text-[#1f2328]">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Order History</Breadcrumbs.Item>
        </Breadcrumbs>

        <h1 className="text-2xl font-black mb-8 flex items-center gap-3 text-[#1f2328] mt-4">
          <ClipboardList className="text-[#0969da]" size={28} /> Order History
        </h1>

        {loading ? (
          <p className="text-[#6e7781] text-sm font-medium py-10">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-[#f6f8fa] rounded-xl border border-dashed border-[#d0d7de]">
            <Package size={48} className="mx-auto text-[#afb8c1] mb-4" />
            <p className="text-[#6e7781] font-medium">
              You haven't placed any orders yet.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="flex w-full flex-col items-start rounded-xl border border-solid border-[#d0d7de] bg-white shadow-sm hover:border-[#0969da] transition-all duration-300 overflow-hidden"
                >
                  <div className="flex w-full flex-col items-start gap-1 px-6 py-5 bg-[#f6f8fa] border-b border-[#d0d7de]">
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-xl font-black text-[#1f2328]">
                        ${order.total_amount.toFixed(2)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(order.order_status)}`}
                      >
                        {order.order_status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#6e7781] flex items-center gap-1 mt-1">
                      <Clock size={12} /> {order.order_date} • Order #
                      {order.order_id}
                    </span>
                  </div>

                  <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-5">
                    <div className="flex w-full min-w-[224px] flex-col items-start gap-4">
                      {order.items &&
                        order.items.map((item, index) => (
                          <React.Fragment key={item.product_id}>
                            <div className="flex w-full flex-col items-start gap-1">
                              <div className="flex w-full flex-wrap items-start justify-between">
                                <span className="text-sm font-bold text-[#1f2328] line-clamp-1 flex-1 pr-4">
                                  {item.product_name}
                                </span>
                                <span className="text-sm font-bold text-[#1f2328] text-right">
                                  ${item.price.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex w-full flex-wrap items-start justify-between">
                                <span className="text-xs font-medium text-[#6e7781]">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-[11px] font-medium text-[#6e7781] text-right truncate max-w-[150px]">
                                  {order.shipping_address}
                                </span>
                              </div>
                            </div>
                            {index < order.items.length - 1 && (
                              <div className="flex h-px w-full flex-none flex-col items-center gap-2 bg-[#eff1f3]" />
                            )}
                          </React.Fragment>
                        ))}
                    </div>

                    <button
                      className="h-10 w-full flex-none rounded-md bg-[#f6f8fa] border border-[#d0d7de] text-sm font-bold text-[#1f2328] hover:bg-[#eff1f3] hover:text-[#0969da] transition-colors"
                      onClick={() => navigate(`/order/${order.order_id}`)}
                    >
                      View Order Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default MyOrders;
