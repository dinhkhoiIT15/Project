import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, LogOut, ClipboardList} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors">
              <ShoppingBag className="w-8 h-8 mr-2" />
              AI E-Shop
            </Link>
          </div>

          {/* Menu Items */}
          <div className="flex items-center space-x-6">
            {/* MỚI: Link My Orders */}
            <Link to="/my-orders" className="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1">
              <ClipboardList size={20} />
              <span className="hidden sm:inline text-sm font-medium">My Orders</span>
            </Link>

            <Link to="/cart" className="text-gray-500 hover:text-primary-600 transition-colors relative">
              <ShoppingCart className="w-6 h-6" />
            </Link>
            <button 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-red-500 transition-colors flex items-center"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;