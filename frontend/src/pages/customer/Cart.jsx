import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const [cart, setCart] = useState({ cart_items: [], total_price: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) { console.error("Error fetching cart", err); }
    finally { setLoading(false); }
  };

  const handleUpdateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (err) { alert("Could not update quantity"); }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm("Remove this item?")) return;
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) { alert("Could not remove item"); }
  };

  if (loading) return <div className="min-h-screen bg-background text-center py-20 font-medium">Loading your cart...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 flex items-center text-gray-800">
          <ShoppingCart className="mr-3 text-primary-600" /> My Shopping Cart
        </h1>

        {cart.cart_items.length === 0 ? (
          <div className="bg-surface p-12 rounded-2xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty. Let's find some AI products!</p>
            <Link to="/">
              <Button className="inline-flex items-center"><ArrowLeft size={18} className="mr-2" /> Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.cart_items.map((item) => (
                <div key={item.cart_item_id} className="bg-surface p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                    <img src={item.image_url || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-gray-800 text-lg">{item.product_name}</h3>
                    <p className="text-primary-600 font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                    <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)} className="p-2 hover:bg-gray-200 text-gray-600"><Minus size={16} /></button>
                    <span className="px-4 font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)} className="p-2 hover:bg-gray-200 text-gray-600"><Plus size={16} /></button>
                  </div>

                  <button onClick={() => handleRemove(item.cart_item_id)} className="text-red-400 hover:text-red-600 p-2 transition-colors" title="Remove">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">${cart.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold uppercase text-xs mt-1">Free Delivery</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Order Total</span>
                  <span className="text-2xl font-extrabold text-primary-600">${cart.total_price.toFixed(2)}</span>
                </div>
              </div>
              {/* Cập nhật Link tới trang Checkout */}
              <Link to="/checkout" className="block w-full">
                <Button fullWidth className="py-4 text-lg shadow-lg shadow-primary-100 flex items-center justify-center">
                  <CreditCard className="mr-2" size={20} /> Checkout Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;