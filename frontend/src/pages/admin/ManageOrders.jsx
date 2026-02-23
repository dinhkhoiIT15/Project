import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Truck, Search, ChevronRight } from 'lucide-react';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data.orders);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { order_status: status });
      fetchAllOrders(); // Refresh list
    } catch (err) { alert("Update failed"); }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Truck className="text-primary-600" /> Manage Customer Orders
      </h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(order => (
              <tr key={order.order_id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-400">#{order.order_id}</td>
                <td className="p-4 font-semibold">{order.customer_name}</td>
                <td className="p-4 font-black text-primary-600">${order.total_amount.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.order_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.order_status}
                  </span>
                </td>
                <td className="p-4">
                  <select 
                    value={order.order_status}
                    onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                    className="text-sm border rounded p-1 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipping">Shipping</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrders;