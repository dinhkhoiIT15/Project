import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
// MỚI: Import thêm các icon trạng thái và io socket
import { ShieldCheck, Truck, Clock, CheckCircle2, XCircle } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { io } from "socket.io-client";

const Checkout = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { fetchCartCount } = useCart();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // MỚI: Các State quản lý luồng chờ xác nhận đơn hàng
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending");
  const [countdown, setCountdown] = useState(60); // Đếm ngược 60 giây

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

  // MỚI: Lắng nghe Socket để biết Admin đã xác nhận chưa + Quản lý đếm ngược
  useEffect(() => {
    if (!placedOrderId) return;

    const socket = io("http://localhost:5000");

    // Nếu admin update trạng thái, tắt ngay nút Hủy và báo thành công
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
          return 0; // Hết giờ
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
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

      // MỚI: Thay vì nhảy trang, ta lưu lại ID đơn hàng để hiện màn hình chờ
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

  // MỚI: Hàm xử lý khi User bấm Hủy đơn hàng
  const handleUserCancel = async () => {
    try {
      await api.put(`/orders/${placedOrderId}/cancel`);
      addToast("Order cancelled. Items returned to your cart.", "info");
      setOrderStatus("cancelled");
      fetchCartCount(); // Load lại số lượng giỏ hàng trên Navbar

      // Tự động quay về giỏ hàng sau 2 giây
      setTimeout(() => navigate("/cart"), 2000);
    } catch (err) {
      addToast(
        "Cannot cancel order. Shop might have already confirmed it.",
        "error",
      );
    }
  };

  // MỚI: Giao diện Màn hình chờ xác nhận (Hiển thị khi đã đặt hàng thành công)
  if (placedOrderId) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
          {orderStatus === "pending" ? (
            <div className="bg-white p-10 rounded-xl border border-[#d0d7de] shadow-sm flex flex-col items-center">
              <div className="w-20 h-20 bg-[#ddf4ff] rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Clock size={40} className="text-[#0969da]" />
              </div>
              <h2 className="text-2xl font-black text-[#1f2328] mb-2">
                Waiting for Confirmation
              </h2>
              <p className="text-[#6e7781] mb-8 font-medium">
                Your order{" "}
                <span className="font-bold text-[#1f2328]">
                  #{placedOrderId}
                </span>{" "}
                is waiting for shop approval.
              </p>

              <div className="bg-[#f6f8fa] w-full p-4 rounded-lg mb-8 border border-[#d0d7de]">
                <p className="text-sm font-bold text-[#1f2328] mb-1">
                  Time remaining to cancel:
                </p>
                <p className="text-4xl font-black text-[#cf222e]">
                  {countdown}s
                </p>
              </div>

              <div className="flex gap-4 w-full">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={handleUserCancel}
                  disabled={countdown === 0} // Hết giờ sẽ vô hiệu hóa nút
                  className={
                    countdown > 0
                      ? "border-[#cf222e] text-[#cf222e] hover:bg-[#ffebe9]"
                      : ""
                  }
                >
                  {countdown > 0 ? "Cancel Order" : "Time Window Closed"}
                </Button>
                <Button fullWidth onClick={() => navigate("/my-orders")}>
                  View Order
                </Button>
              </div>
            </div>
          ) : orderStatus === "cancelled" ? (
            <div className="bg-white p-10 rounded-xl border border-[#cf222e]/30 shadow-sm flex flex-col items-center">
              <XCircle size={60} className="text-[#cf222e] mb-4" />
              <h2 className="text-2xl font-black text-[#cf222e] mb-2">
                Order Cancelled
              </h2>
              <p className="text-[#6e7781] mb-6 font-medium">
                Your items have been safely returned to your cart.
              </p>
              <Button onClick={() => navigate("/cart")}>Back to Cart</Button>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-xl border border-[#1a7f37]/30 shadow-sm flex flex-col items-center">
              <CheckCircle2
                size={60}
                className="text-[#1a7f37] mb-4 animate-bounce"
              />
              <h2 className="text-2xl font-black text-[#1a7f37] mb-2">
                Order Confirmed!
              </h2>
              <p className="text-[#6e7781] mb-6 font-medium">
                The shop is now processing your order. Thank you!
              </p>
              <Button onClick={() => navigate("/my-orders")}>
                Track Order
              </Button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Giao diện Checkout bình thường (Chưa đặt hàng)
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item to="/cart">Cart</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Checkout</Breadcrumbs.Item>
        </Breadcrumbs>

        <h1 className="text-2xl font-black mb-8 flex items-center text-[#1f2328] mt-4">
          <ShieldCheck className="mr-3 text-[#0969da]" size={28} /> Secure
          Checkout
        </h1>

        <div className="bg-white p-10 rounded-xl border border-[#d0d7de] shadow-sm">
          <form onSubmit={handleCheckout} className="space-y-8">
            <Input
              label="Shipping Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House no, Street, City..."
              required
            />

            <div>
              <h2 className="text-lg font-bold mb-4 text-[#1f2328]">
                Payment Method
              </h2>
              <div className="grid gap-4">
                <label className="flex items-center p-4 border border-[#0969da] bg-[#ddf4ff]/30 rounded-lg cursor-default transition-all shadow-sm">
                  <div className="w-5 h-5 rounded-full border-4 border-[#0969da] flex items-center justify-center bg-white">
                    <div className="w-2 h-2 rounded-full bg-[#0969da]" />
                  </div>
                  <div className="ml-4 flex flex-col">
                    <span className="font-bold text-[#1f2328]">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs text-[#6e7781]">
                      Pay when you receive your order
                    </span>
                  </div>
                  <Truck className="ml-auto text-[#0969da]" size={20} />
                </label>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="py-4 text-lg font-black shadow-sm"
            >
              Confirm & Place Order
            </Button>

            <p className="text-[11px] text-center text-[#6e7781] uppercase tracking-widest mt-4">
              Your data is encrypted and secure with DK-ECOM
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
