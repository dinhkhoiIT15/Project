import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Smartphone, QrCode, ShieldCheck, Loader2, XCircle } from 'lucide-react';

const MoMoPayment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handleMoMoPay = async () => {
    setProcessing(true);
    try {
      // MỚI: Tạo mã giao dịch giả lập cho MoMo
      const mockMomoId = "MOMO-" + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      await api.put(`/orders/${orderId}/pay`, { transaction_id: mockMomoId });
      
      setTimeout(() => {
        addToast("MoMo Payment Successful!", "success");
        navigate('/my-orders');
      }, 1000);
    } catch (err) { 
      addToast("Payment failed.", "error"); 
      setProcessing(false); 
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Cancel MoMo payment and return to cart?")) {
      setProcessing(true);
      try {
        await api.delete(`/orders/${orderId}/cancel`);
        addToast("Transaction stopped. Items returned to cart.", "info");
        navigate('/cart');
      } catch (err) { navigate('/cart'); }
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100">
        <div className="bg-[#A50064] p-8 text-center text-white font-black">
          <Smartphone className="mx-auto mb-3" size={40} />
          <h1 className="text-2xl uppercase tracking-tighter">MoMo Payment</h1>
        </div>
        <div className="p-10 text-center">
          <div className="bg-white p-4 border-2 border-pink-100 rounded-3xl mb-8 inline-block shadow-inner">
            <QrCode size={160} className="text-gray-800" />
          </div>
          <div className="space-y-4">
            <Button onClick={handleMoMoPay} fullWidth isLoading={processing} className="bg-[#A50064] hover:bg-[#80004d] py-4 text-lg rounded-2xl">
              Pay with MoMo
            </Button>
            <button 
              onClick={handleCancel} 
              disabled={processing} 
              className="w-full flex items-center justify-center py-3 text-gray-400 hover:text-pink-600 font-bold"
            >
              <XCircle className="mr-2" size={20}/> Stop Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoMoPayment;