import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Truck, CheckCircle, ShieldCheck, Smartphone } from 'lucide-react';

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8 flex items-center"><ShieldCheck className="mr-3 text-primary-600" /> Secure Checkout</h1>
        <div className="bg-surface p-10 rounded-2xl border shadow-sm">
          <form onSubmit={handleCheckout} className="space-y-8">
            <Input label="Shipping Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House no, Street, City..." required />
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="grid gap-4">
                {['COD', 'ONLINE', 'MOMO'].map(m => (
                  <label key={m} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === m ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <input type="radio" name="pay" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} className="w-5 h-5 text-primary-600" />
                    <span className="ml-4 font-bold text-gray-700">{m === 'COD' ? 'Cash on Delivery' : m === 'ONLINE' ? 'VNPay / Banking' : 'Ví MoMo'}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" fullWidth isLoading={loading} className="py-4 text-lg font-bold shadow-lg shadow-primary-100">Confirm Order</Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Checkout;