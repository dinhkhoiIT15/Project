import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext"; // MỚI IMPORT
import { ShoppingCart, CreditCard, ArrowLeft } from "lucide-react";
import CartItem from "../../components/cart/CartItem";
import Breadcrumbs from "../../components/common/Breadcrumbs";

const Cart = () => {
  const [cart, setCart] = useState({ cart_items: [], total_price: 0 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { fetchCartCount } = useCart(); // MỚI

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("/cart");
      setCart(res.data);
      fetchCartCount(); // MỚI: Đồng bộ số lượng để chắc chắn Navbar luôn đúng
    } catch (err) {
      addToast("Failed to load your cart", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      fetchCart(); // Hàm này chạy sẽ tự động kéo theo fetchCartCount() ở trên
      addToast("Cart updated successfully!", "success");
    } catch (err) {
      addToast("Failed to update quantity", "error");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart(); // Hàm này chạy sẽ tự động kéo theo fetchCartCount() ở trên
      addToast("Item has been removed from your cart", "info");
    } catch (err) {
      addToast("Failed to remove item", "error");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="text-center py-20 font-bold text-[#6e7781]">
          Loading your shopping cart...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Shopping Cart</Breadcrumbs.Item>
        </Breadcrumbs>

        <div className="flex w-full flex-col items-start gap-6 mt-4">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1f2328]">
            <ShoppingCart className="text-[#6e7781]" size={28} /> Cart
          </h1>

          {cart.cart_items.length === 0 ? (
            <div className="w-full border border-solid border-[#d0d7de] p-16 rounded-lg text-center bg-[#f6f8fa]">
              <p className="text-[#6e7781] mb-6">
                Your cart is currently empty.
              </p>
              <Link to="/">
                <Button variant="outline">Start Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="flex w-full flex-wrap items-start overflow-hidden rounded-md border border-solid border-[#d0d7de] bg-white">
              <div className="flex grow shrink-0 basis-0 flex-col flex-wrap items-start border-r border-solid border-[#d0d7de] mobile:border-r-0 mobile:border-b">
                {cart.cart_items.map((item) => (
                  <CartItem
                    key={item.cart_item_id}
                    item={item}
                    onUpdateQty={handleUpdateQty}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 self-stretch px-6 py-6 min-w-[320px] bg-[#f6f8fa]">
                <div className="flex w-full items-center justify-between">
                  <span className="text-lg font-medium text-[#6e7781]">
                    Subtotal
                  </span>
                  <span className="text-2xl font-bold text-[#1f2328]">
                    ${cart.total_price.toFixed(2)}
                  </span>
                </div>

                <Link to="/checkout" className="w-full">
                  <Button className="h-12 w-full flex-none shadow-sm" fullWidth>
                    <CreditCard className="mr-2" size={20} /> Continue to
                    checkout
                  </Button>
                </Link>

                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-[#6e7781] text-center">
                    Taxes &amp; shipping calculated at checkout
                  </span>
                  <Link
                    to="/"
                    className="text-sm font-bold text-[#0969da] hover:underline flex items-center"
                  >
                    <ArrowLeft size={14} className="mr-1" /> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Cart;
