import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tags, Package, MessageSquareWarning, LogOut, ShoppingBag, Truck } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  // Danh sách các menu điều hướng
  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    // Các trang này chúng ta sẽ tạo ở bước sau:
    { path: '/admin/categories', icon: <Tags size={20} />, label: 'Categories' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/orders', icon: <Truck size={20} />, label: 'Manage Orders' }, // MỚI
    { path: '/admin/reviews', icon: <MessageSquareWarning size={20} />, label: 'Fake Reviews (AI)' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar bên trái */}
      <aside className="w-64 bg-surface border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 flex items-center text-primary-600 font-bold text-xl border-b border-gray-100">
          <ShoppingBag className="w-8 h-8 mr-2" />
          Admin Panel
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            // Xác định xem menu nào đang được chọn
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  isActive 
                    ? 'bg-primary-50 text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-primary-500'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Nút Đăng xuất ở cuối Sidebar */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </aside>

      {/* Khu vực Nội dung chính (Outlet sẽ render Dashboard, Products... vào đây) */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;