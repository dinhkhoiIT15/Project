import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Tags,
  Package,
  MessageSquareWarning,
  LogOut,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: "/admin", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { path: "/admin/users", icon: <Users size={18} />, label: "Users" },
    {
      path: "/admin/categories",
      icon: <Tags size={18} />,
      label: "Categories",
    },
    { path: "/admin/products", icon: <Package size={18} />, label: "Products" },
    { path: "/admin/orders", icon: <Truck size={18} />, label: "Orders" },
    {
      path: "/admin/reviews",
      icon: <MessageSquareWarning size={18} />,
      label: "AI Reviews",
    },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <aside className="w-64 bg-[#f6f8fa] border-r border-[#d0d7de] flex flex-col">
        <div className="p-6 border-b border-[#d0d7de] bg-white">
          <Link
            to="/"
            className="flex items-center text-[#1f2328] font-black text-xl"
          >
            <div className="bg-[#1f2328] p-1.5 rounded-md mr-3">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            ADMIN
          </Link>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <h3 className="px-3 text-[10px] font-bold text-[#6e7781] uppercase mb-2 tracking-wider">
            Management
          </h3>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (location.pathname.startsWith(item.path) &&
                item.path !== "/admin");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium border border-transparent ${
                  isActive
                    ? "bg-white border-[#d0d7de] text-[#1f2328] border-l-4 border-l-[#0969da] shadow-sm"
                    : "text-[#1f2328] hover:bg-[#eff1f3]"
                }`}
              >
                <span
                  className={`${isActive ? "text-[#0969da]" : "text-[#6e7781]"} mr-3`}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#d0d7de] bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-[#cf222e] hover:bg-[#fff8f7] rounded-md transition-colors font-bold"
          >
            <LogOut size={18} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white p-10">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
