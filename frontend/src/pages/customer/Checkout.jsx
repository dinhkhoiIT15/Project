import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { ShieldCheck, Truck } from "lucide-react";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const Checkout = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy thông tin địa chỉ mặc định từ hồ sơ người dùng
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

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address) {
      addToast("Shipping address is required!", "error");
      return;
    }

    setLoading(true);
    try {
      // Chỉ gửi yêu cầu thanh toán COD lên Backend
      await api.post("/orders/checkout", {
        shipping_address: address,
        payment_method: "COD",
      });

      addToast("Order placed successfully! Thank you.", "success");
      // Chuyển hướng người dùng về trang danh sách đơn hàng sau khi đặt thành công
      navigate("/my-orders");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Order failed. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hệ thống dẫn hướng Breadcrumbs */}
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
            {/* Nhập địa chỉ giao hàng */}
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
              {/* Chỉ hiển thị tùy chọn COD duy nhất theo yêu cầu */}
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
