import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, LogOut, ClipboardList, LogIn, User, X, ArrowLeft, Settings } from 'lucide-react';
import Login from '../../pages/auth/Login';
import Register from '../../pages/auth/Register';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState('default'); 
  
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (location.state?.openLogin) {
      setIsSidebarOpen(true);
      setSidebarView('login');
      window.history.replaceState({}, document.title);
    } else if (location.state?.openRegister) {
      setIsSidebarOpen(true);
      setSidebarView('register');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setIsSidebarOpen(false); 
    setSidebarView('default');
    navigate('/');
  };

  const handleLoginSuccess = (role) => {
    if (role === 'Admin') {
      window.location.href = '/admin'; 
    } else {
      window.location.reload(); 
    }
  };

  const getSidebarTitle = () => {
    if (token) return "My Account";
    if (sidebarView === 'login') return "Sign In";
    if (sidebarView === 'register') return "Create Account";
    return "Welcome"; 
  };

  return (
    <>
      <nav className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center text-primary-600 font-bold text-xl hover:text-primary-700 transition-colors">
                <ShoppingBag className="w-8 h-8 mr-2" />
                DK-ECOM
              </Link>
            </div>

            {/* Icons Bar */}
            <div className="flex items-center space-x-6">
              <Link to="/cart" className="text-gray-500 hover:text-primary-600 transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
              </Link>

              {/* Profile Trigger */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline font-medium text-sm">
                  {token && username ? `Hello, ${username}` : "Sign In"}
                </span>
              </button>
            </div>
            
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* RIGHT SIDEBAR PANEL */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-surface">
          <div className="flex items-center">
            {sidebarView !== 'default' && !token && (
              <button onClick={() => setSidebarView('default')} className="p-2 -ml-2 mr-2 text-gray-400 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {getSidebarTitle()}
            </h2>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
          {token ? (
            // --- KHU VỰC USER ĐÃ ĐĂNG NHẬP ---
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="p-4 bg-primary-50 rounded-xl mb-6">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="text-xl font-black text-primary-700">{username}</p>
              </div>

              {/* MỚI THÊM: Menu Account Settings */}
              <Link to="/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-semibold">
                <Settings className="w-5 h-5 mr-3 text-primary-500" /> Account Settings
              </Link>

              <Link to="/my-orders" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-semibold">
                <ClipboardList className="w-5 h-5 mr-3 text-primary-500" /> My Orders
              </Link>
              
              {localStorage.getItem('role') === 'Admin' && (
                <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-4 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-semibold">
                  <ShoppingBag className="w-5 h-5 mr-3 text-primary-500" /> Admin Dashboard
                </Link>
              )}

              <div className="mt-auto border-t border-gray-100 pt-6">
                <button onClick={handleLogout} className="flex items-center justify-center w-full p-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold">
                  <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
              </div>
            </div>
          ) : (
            // --- KHU VỰC CHƯA ĐĂNG NHẬP ---
            <>
              {sidebarView === 'default' && (
                <div className="space-y-4 flex-1 mt-4">
                  <p className="text-gray-500 mb-8 text-sm text-center">Sign in to track orders, manage your cart, and checkout seamlessly.</p>
                  <button onClick={() => setSidebarView('login')} className="flex items-center justify-center w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-md shadow-primary-200">
                    <LogIn className="w-5 h-5 mr-2" /> Sign In
                  </button>
                  <button onClick={() => setSidebarView('register')} className="flex items-center justify-center w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                    Create Account
                  </button>
                </div>
              )}

              {sidebarView === 'login' && (
                <Login 
                  onLoginSuccess={handleLoginSuccess} 
                  switchToRegister={() => setSidebarView('register')} 
                />
              )}

              {sidebarView === 'register' && (
                <Register 
                  switchToLogin={() => setSidebarView('login')} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;