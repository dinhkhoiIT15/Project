import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ClipboardList,
  User,
  X,
  Settings,
} from "lucide-react";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import Button from "../common/Button";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const NavItem = ({ children, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`group flex h-12 cursor-pointer flex-col items-center justify-center gap-4 px-4 transition-colors ${className}`}
  >
    <span className="text-sm font-bold text-[#6e7781] group-hover:text-[#1f2328]">
      {children}
    </span>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState("default");

  // Sử dụng dữ liệu từ AuthContext thay vì localStorage trực tiếp
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (location.state?.openLogin) {
      setIsSidebarOpen(true);
      setSidebarView("login");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleLogout = () => {
    logout(); // Gọi hàm logout từ Context để xóa sạch session/local storage
    setIsSidebarOpen(false);
    navigate("/");
  };

  const handleLoginSuccess = (role) => {
    setIsSidebarOpen(false); // Đóng sidebar sau khi đăng nhập thành công
    if (role === "Admin") navigate("/admin");
    // Không cần reload vì AuthContext sẽ tự động cập nhật UI
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md py-4 px-4">
        <div className="mx-auto flex w-full max-w-[1250px] flex-wrap items-center gap-4 rounded-md border border-solid border-[#d0d7de] bg-white shadow-md overflow-hidden">
          <div className="flex h-12 flex-col items-start justify-center px-6 border-r border-[#d0d7de] bg-[#f6f8fa]">
            <Link
              to="/"
              className="flex items-center text-[#1f2328] font-black text-lg hover:text-[#0969da] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2 text-[#0969da]" />
              DK-ECOM
            </Link>
          </div>

          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-wrap items-center gap-2">
            <NavItem onClick={() => navigate("/")}>Home</NavItem>
          </div>

          <div className="flex items-center gap-3 px-4">
            <Link
              to="/cart"
              className="relative p-2 text-[#6e7781] hover:text-[#0969da] hover:bg-[#f6f8fa] rounded-full transition-all"
            >
              <ShoppingCart size={22} />
            </Link>
            <div className="h-6 w-px bg-[#d0d7de]" />
            <button
              onClick={() => {
                setSidebarView("default");
                setIsSidebarOpen(true);
              }}
              className="flex items-center gap-2 text-[#1f2328] hover:text-[#0969da] bg-[#f6f8fa] border border-[#d0d7de] px-4 py-1.5 rounded-md text-sm font-bold shadow-sm hover:bg-white transition-all"
            >
              <User size={18} className="text-[#0969da]" />
              <span className="hidden sm:inline">
                {/* Hiển thị username từ user object trong Context */}
                {isAuthenticated ? user?.username : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-[#d0d7de] shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-5 flex justify-between items-center border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h2 className="text-sm font-black text-[#1f2328] uppercase tracking-widest">
            {isAuthenticated
              ? "Account Overview"
              : sidebarView === "login"
                ? "Welcome Back"
                : sidebarView === "register"
                  ? "Join Us"
                  : "Navigation"}
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-[#d0d7de]/40 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[#6e7781]" />
          </button>
        </div>

        <div className="p-6 flex flex-col h-full overflow-y-auto">
          {isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center p-4 border border-[#d0d7de] rounded-lg mb-6 bg-gradient-to-br from-[#f6f8fa] to-white shadow-sm">
                <div className="w-12 h-12 bg-[#0969da] text-white rounded-md flex items-center justify-center font-black text-xl shadow-md mr-4">
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#6e7781] uppercase tracking-tighter">
                    Signed in as
                  </p>
                  <p className="text-lg font-black text-[#1f2328]">
                    {user?.username}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center p-3 text-sm text-[#1f2328] hover:bg-[#f6f8fa] hover:text-[#0969da] rounded-md font-bold transition-colors"
              >
                <Settings className="w-4 h-4 mr-3" /> Account Settings
              </Link>
              <Link
                to="/my-orders"
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center p-3 text-sm text-[#1f2328] hover:bg-[#f6f8fa] hover:text-[#0969da] rounded-md font-bold transition-colors"
              >
                <ClipboardList className="w-4 h-4 mr-3" /> My Orders
              </Link>

              {/* Nếu là Admin thì hiển thị thêm nút Dashboard */}
              {user?.role === "Admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center p-3 text-sm text-[#1f2328] hover:bg-[#f6f8fa] hover:text-[#0969da] rounded-md font-bold transition-colors"
                >
                  <Settings className="w-4 h-4 mr-3" /> Admin Dashboard
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-sm text-[#cf222e] hover:bg-[#fff8f7] rounded-md font-bold mt-6 pt-6 border-t border-[#d0d7de] transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="mt-2">
              {sidebarView === "default" && (
                <div className="space-y-4">
                  <div className="py-10 text-center">
                    <ShoppingBag
                      size={48}
                      className="mx-auto text-[#d0d7de] mb-4"
                    />
                    <p className="text-gray-500 text-sm px-10">
                      Sign in to sync your cart and track your favorite items
                      across devices.
                    </p>
                  </div>
                  <Button
                    onClick={() => setSidebarView("login")}
                    fullWidth
                    className="py-3 shadow-md"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => setSidebarView("register")}
                    fullWidth
                    variant="outline"
                    className="py-3"
                  >
                    Create Account
                  </Button>
                </div>
              )}
              {sidebarView === "login" && (
                <Login
                  onLoginSuccess={handleLoginSuccess}
                  switchToRegister={() => setSidebarView("register")}
                />
              )}
              {sidebarView === "register" && (
                <Register switchToLogin={() => setSidebarView("login")} />
              )}
            </div>
          )}
        </div>
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
