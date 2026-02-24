import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext'; // Import Toast Hook
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState({ cart_items: [], total_price: 0 });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast(); // Khởi tạo Toast

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) { 
      console.error(err); 
      addToast('Failed to load your cart', 'error'); // Thông báo lỗi tải giỏ hàng
    }
    finally { setLoading(false); }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      fetchCart();
      addToast('Quantity updated successfully!', 'success'); // Thông báo cập nhật số lượng
    } catch (err) { 
      addToast('Failed to update quantity', 'error'); 
    }
  };

  const handleRemove = async (itemId) => {
    // Đã loại bỏ window.confirm theo yêu cầu để sử dụng trải nghiệm Toast đồng nhất
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
      addToast('Item removed from cart', 'info'); // Thông báo xóa sản phẩm bằng Toast
    } catch (err) { 
      addToast('Failed to remove item', 'error'); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="text-center py-20 font-bold text-gray-500">Loading your cart...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8 flex items-center text-gray-800">
          <ShoppingCart className="mr-3 text-primary-600" /> Shopping Cart
        </h1>

        {cart.cart_items.length === 0 ? (
          <div className="bg-surface p-20 rounded-2xl text-center shadow-sm border border-gray-100 animate-fade-in">
            <p className="text-gray-400 text-xl mb-6 font-medium">Your cart is currently empty.</p>
            <Link to="/"><Button className="px-10 py-3 shadow-lg shadow-primary-100">Shop Now</Button></Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Danh sách sản phẩm trong giỏ */}
            <div className="lg:col-span-2 space-y-4">
              {cart.cart_items.map(item => (
                <div key={item.cart_item_id} className="bg-surface p-4 rounded-xl flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                  <img src={item.image_url} className="w-24 h-24 rounded-lg object-cover bg-gray-50" alt={item.product_name} />
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{item.product_name}</h3>
                    <p className="text-primary-600 font-extrabold text-xl">${item.price.toFixed(2)}</p>
                  </div>
                  
                  {/* Bộ điều khiển số lượng */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <button 
                      onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)} 
                      className="p-3 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Minus size={16}/>
                    </button>
                    <span className="px-4 font-bold text-gray-800 w-10 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)} 
                      className="p-3 hover:bg-gray-200 text-gray-600 transition-colors"
                    >
                      <Plus size={16}/>
                    </button>
                  </div>
                  
                  {/* Nút xóa */}
                  <button 
                    onClick={() => handleRemove(item.cart_item_id)} 
                    className="text-red-400 hover:text-red-600 p-3 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove item"
                  >
                    <Trash2 size={24}/>
                  </button>
                </div>
              ))}
            </div>

            {/* Bảng tổng kết đơn hàng */}
            <div className="bg-surface p-8 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
              <h2 className="text-2xl font-black mb-8 text-gray-800 border-b pb-4">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-medium text-gray-600 text-lg">
                  <span>Subtotal</span>
                  <span className="text-gray-800 font-bold">${cart.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600 font-black uppercase text-xs px-2 py-1 bg-green-50 rounded-md">Free</span>
                </div>
                <div className="border-t pt-6 flex justify-between items-end">
                  <span className="text-xl font-bold text-gray-800">Total</span>
                  <span className="text-3xl font-black text-primary-600">${cart.total_price.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button fullWidth className="py-5 text-xl font-black shadow-xl shadow-primary-100">
                  <CreditCard className="mr-2" /> Checkout Now
                </Button>
              </Link>
              <div className="mt-6 text-center">
                <Link to="/" className="text-gray-400 hover:text-primary-600 font-bold text-sm flex items-center justify-center transition-colors">
                  <ArrowLeft size={16} className="mr-2" /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;