import React from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

const Dashboard = () => {
  // Dữ liệu mẫu (Mock data) hiển thị cho đẹp, sau này có thể fetch từ API
  const stats = [
    { title: 'Total Revenue', value: '$12,500', icon: <DollarSign className="text-green-500" size={24} />, bg: 'bg-green-100' },
    { title: 'Total Orders', value: '150', icon: <ShoppingCart className="text-blue-500" size={24} />, bg: 'bg-blue-100' },
    { title: 'Products', value: '45', icon: <Package className="text-purple-500" size={24} />, bg: 'bg-purple-100' },
    { title: 'Active Users', value: '89', icon: <Users className="text-orange-500" size={24} />, bg: 'bg-orange-100' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>
      
      {/* 4 Thẻ Thống kê (Stats Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full ${stat.bg} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Lời chào */}
      <div className="bg-surface p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20 mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Admin Control Panel</h2>
        <p className="text-gray-500">
          Use the sidebar menu to manage categories, add products (with AI auto-descriptions), 
          and monitor AI-detected fake reviews.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;