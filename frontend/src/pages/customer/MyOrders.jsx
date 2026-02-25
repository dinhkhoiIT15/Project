import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import api from '../../services/api';
import { ClipboardList, Clock, Package } from 'lucide-react';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Pagination from '../../components/common/Pagination'; // Tái sử dụng component Pagination

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Tự động gọi lại API khi số trang thay đổi
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // THAY ĐỔI: Truyền tham số per_page=5 lên Backend
      const res = await api.get(`/orders/my-orders?page=${currentPage}&per_page=5`);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
          <p className="text-[#6e7781] text-sm font-medium py-10">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-[#f6f8fa] rounded-xl border border-dashed border-[#d0d7de]">
            <Package size={48} className="mx-auto text-[#afb8c1] mb-4" />
            <p className="text-[#6e7781] font-medium">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.order_id} className="bg-white p-6 rounded-lg shadow-sm border border-[#d0d7de] hover:border-[#0969da] transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">Order #{order.order_id}</h3>
                      <p className="text-xs text-[#6e7781] flex items-center gap-1 mt-1 font-medium">
                        <Clock size={12} /> {order.order_date}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusStyle(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div className="border-t border-[#d0d7de] pt-4 flex justify-between items-center">
                    <p className="text-[#6e7781] text-sm">
                      Shipping to: <span className="font-bold text-[#1f2328]">{order.shipping_address}</span>
                    </p>
                    <p className="text-xl font-black text-[#1f2328]">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Component phân trang */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu khi chuyển trang
              }} 
            />
          </>
        )}
      </main>
    </div>
  );
};

export default MyOrders;