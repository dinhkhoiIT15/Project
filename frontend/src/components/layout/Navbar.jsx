import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ClipboardList,
  User,
  X,
  Settings,
  Search,
  Loader2,
  Package,
} from "lucide-react";
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext"; // MỚI IMPORT
import api from "../../services/api";

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
  const [sidebarView, setSidebarView] = useState("login");

  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart(); // MỚI: Lấy số lượng giỏ hàng

  // ----- STATES CHO LIVE SEARCH -----
  const [searchTerm, setSearchTerm] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("search");
    if (location.pathname === "/" && query) {
      setSearchTerm(query);
    } else {
      setSearchTerm("");
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.state?.openLogin) {
      setIsSidebarOpen(true);
      setSidebarView("login");
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setLiveResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsTyping(true);
      try {
        const res = await api.get(`/products?search=${searchTerm}&per_page=5`);
        setLiveResults(res.data.products || []);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsTyping(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => logout();

  const handleLoginSuccess = (role) => {
    setIsSidebarOpen(false);
    if (role === "Admin") navigate("/admin");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md py-4 px-4">
        <div className="mx-auto flex w-full max-w-[1250px] items-center rounded-md border border-solid border-[#d0d7de] bg-white shadow-md overflow-visible">
          <div className="flex h-12 flex-col items-start justify-center px-6 border-r border-[#d0d7de] bg-[#f6f8fa] shrink-0 rounded-l-md">
            <Link
              to="/"
              className="flex items-center text-[#1f2328] font-black text-lg hover:text-[#0969da] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-2 text-[#0969da]" />
              DK-ECOM
            </Link>
          </div>

          <div className="flex flex-1 items-center px-2">
            <NavItem onClick={() => navigate("/")}>Home</NavItem>
          </div>

          <div className="flex items-center gap-2 px-4 shrink-0">
            <div className="relative flex items-center" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6e7781]"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-40 sm:w-48 lg:w-56 pl-9 pr-4 py-1.5 bg-transparent border border-transparent rounded-md text-sm transition-all duration-300 outline-none hover:bg-[#f6f8fa] focus:w-56 lg:focus:w-72 focus:bg-white focus:border-[#0969da] focus:ring-3 focus:ring-[#0969da]/10 placeholder:text-[#6e7781]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => {
                    if (searchTerm.trim()) setShowDropdown(true);
                  }}
                  autoComplete="off"
                />
              </form>

              {showDropdown && (
                <div className="absolute top-full mt-3 right-0 w-[350px] bg-white border border-[#d0d7de] rounded-md shadow-2xl z-50 overflow-hidden animate-fade-in">
                  {isTyping ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0969da]" />
                    </div>
                  ) : liveResults.length > 0 ? (
                    <ul className="max-h-[350px] overflow-y-auto">
                      {liveResults.map((product) => (
                        <li
                          key={product.product_id}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate(`/product/${product.product_id}`);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-[#f6f8fa] cursor-pointer border-b border-[#d0d7de] last:border-0 transition-colors"
                        >
                          <div className="w-10 h-10 bg-white border border-[#d0d7de] rounded overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package size={20} className="text-[#afb8c1]" />
                            )}
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-sm font-bold text-[#1f2328] truncate">
                              {product.name}
                            </span>
                            <span className="text-xs font-black text-[#0969da]">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </li>
                      ))}
                      <li
                        onClick={handleSearchSubmit}
                        className="p-3 text-center text-xs font-bold text-[#0969da] hover:bg-[#f6f8fa] cursor-pointer transition-colors bg-[#f6f8fa]/50"
                      >
                        View all results for "{searchTerm}"
                      </li>
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-sm font-medium text-[#6e7781]">
                      No products match "{searchTerm}"
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-[#d0d7de] mx-1" />

            {/* MỚI: Thiết kế Badge giỏ hàng đè lên Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-[#6e7781] hover:text-[#0969da] hover:bg-[#f6f8fa] rounded-full transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#cf222e] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                setSidebarView("login");
                setIsSidebarOpen(true);
              }}
              className="flex items-center gap-2 text-[#1f2328] hover:text-[#0969da] bg-[#f6f8fa] border border-[#d0d7de] px-4 py-1.5 rounded-md text-sm font-bold shadow-sm hover:bg-white transition-all ml-1"
            >
              <User size={16} className="text-[#0969da]" />
              <span className="hidden sm:inline">
                {isAuthenticated ? user?.username : "Sign In"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-[#d0d7de] shadow-2xl z-50 transform transition-transform duration-500 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5 flex justify-between items-center border-b border-[#d0d7de] bg-[#f6f8fa]">
          <h2 className="text-sm font-black text-[#1f2328] uppercase tracking-widest">
            {isAuthenticated
              ? "Account Overview"
              : sidebarView === "login"
                ? "Sign In"
                : "Create Account"}
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
