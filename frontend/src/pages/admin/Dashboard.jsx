import React from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '$12,500', icon: <DollarSign size={20} />, color: 'text-[#1a7f37]', bg: 'bg-[#dafbe1]' },
    { title: 'Total Orders', value: '150', icon: <ShoppingCart size={20} />, color: 'text-[#0969da]', bg: 'bg-[#ddf4ff]' },
    { title: 'Products', value: '45', icon: <Package size={20} />, color: 'text-[#8250df]', bg: 'bg-[#f5f0ff]' },
    { title: 'Active Users', value: '89', icon: <Users size={20} />, color: 'text-[#bf3989]', bg: 'bg-[#fff0f7]' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-[#1f2328] mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-lg border border-[#d0d7de] flex items-center hover:border-[#0969da] transition-colors shadow-sm">
            <div className={`p-3 rounded-md ${stat.bg} ${stat.color} mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-[#6e7781] uppercase tracking-tight">{stat.title}</p>
              <h3 className="text-xl font-black text-[#1f2328]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#f6f8fa] p-10 rounded-xl border border-[#d0d7de] text-center border-dashed">
        <h2 className="text-xl font-bold text-[#1f2328] mb-2">System operational</h2>
        <p className="text-[#6e7781] text-sm max-w-lg mx-auto">
          All services are running smoothly. Use the sidebar to manage your store inventory, 
          process customer orders, and monitor platform activity.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;