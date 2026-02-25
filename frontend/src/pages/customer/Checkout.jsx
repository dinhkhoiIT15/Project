import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const Checkout = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.data.user.address) setAddress(res.data.user.address);
      } catch (err) { console.error(err); }
    };
    fetchProfile();
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!address) { addToast('Shipping address is required!', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.post('/orders/checkout', { shipping_address: address, payment_method: paymentMethod });
      const orderId = res.data.order_id;
      if (paymentMethod === 'ONLINE') navigate(`/payment/${orderId}`);
      else if (paymentMethod === 'MOMO') navigate(`/payment-momo/${orderId}`);
      else {
        addToast('Order placed successfully! Thank you.', 'success');
        navigate('/my-orders');
      }
    } catch (err) { addToast('Order failed. Please try again.', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumbs>
          <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item to="/cart">Cart</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active>Checkout</Breadcrumbs.Item>
        </Breadcrumbs>

        <h1 className="text-2xl font-black mb-8 flex items-center text-[#1f2328]">
          <ShieldCheck className="mr-3 text-[#0969da]" size={28} /> Secure Checkout
        </h1>

        <div className="bg-white p-10 rounded-xl border border-[#d0d7de] shadow-sm">
          <form onSubmit={handleCheckout} className="space-y-8">
            <Input label="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, Street, City..." required />
            <div>
              <h2 className="text-lg font-bold mb-4 text-[#1f2328]">Payment Method</h2>
              <div className="grid gap-4">
                {['COD', 'ONLINE', 'MOMO'].map(m => (
                  <label key={m} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === m ? 'border-[#0969da] bg-[#ddf4ff]/30' : 'border-[#d0d7de] hover:bg-[#f6f8fa]'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="w-4 h-4 text-[#0969da]" />
                    <span className="ml-4 font-bold text-[#1f2328]">{m === 'COD' ? 'Cash on Delivery' : m === 'ONLINE' ? 'VNPay / Banking' : 'Ví MoMo'}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" fullWidth isLoading={loading} className="py-4 text-lg font-bold">Confirm Order</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;