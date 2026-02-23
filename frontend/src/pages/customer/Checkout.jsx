import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { CreditCard, MapPin, ShoppingBag, CheckCircle, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ cart_items: [], total_price: 0 });
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    fetchCartSummary();
  }, []);

  const fetchCartSummary = async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data);
      if (res.data.cart_items.length === 0 && !orderSuccess) {
        navigate('/cart');
      }
    } catch (err) {
      console.error("Error fetching cart summary", err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      alert("Please enter your shipping address!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API checkout đã định nghĩa trong order_routes.py
      // Truyền shipping_address vào JSON body
      const res = await api.post('/orders/checkout', {
        shipping_address: shippingAddress
      });
      
      setOrderId(res.data.order_id);
      setOrderSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(err.response?.data?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 text-lg mb-8">
            Thank you for your purchase. Your order ID is <span className="font-bold text-primary-600">#{orderId}</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="secondary" className="w-full sm:w-auto">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center mb-8">
          <Link to="/cart" className="text-gray-500 hover:text-primary-600 mr-4 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8 animate-fade-in">
            <section className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                <MapPin className="mr-2 text-primary-500" size={20} />
                Shipping Information
              </h2>
              <form onSubmit={handlePlaceOrder}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your street address, city, and zip code..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition-all h-32 resize-none bg-surface text-gray-800"
                  />
                </div>
                
                <h2 className="text-xl font-bold mt-10 mb-6 flex items-center text-gray-800">
                  <CreditCard className="mr-2 text-primary-500" size={20} />
                  Payment Method
                </h2>
                <div className="p-4 border-2 border-primary-500 bg-primary-50 rounded-xl flex items-center mb-8">
                  <div className="w-4 h-4 rounded-full bg-primary-600 mr-3"></div>
                  <span className="font-semibold text-primary-900">Cash on Delivery (COD)</span>
                </div>

                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={loading}
                  className="py-4 text-lg"
                >
                  Place My Order - ${cart.total_price.toFixed(2)}
                </Button>
              </form>
            </section>
          </div>

          <div className="animate-fade-in">
            <section className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800 border-b pb-4">
                <ShoppingBag className="mr-2 text-primary-500" size={20} />
                Order Summary
              </h2>
              
              <div className="max-h-80 overflow-y-auto mb-6 pr-2">
                {cart.cart_items.map((item) => (
                  <div key={item.cart_item_id} className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 mr-3 shrink-0">
                        <img src={item.image_url || 'https://via.placeholder.com/50'} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cart.total_price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-primary-600">${cart.total_price.toFixed(2)}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;