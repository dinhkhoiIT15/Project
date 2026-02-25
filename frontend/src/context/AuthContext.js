import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Ưu tiên kiểm tra sessionStorage (Admin) trước, sau đó mới đến localStorage (Customer)
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (token) {
        try {
          const res = await api.get("/user/profile");
          const userData = res.data.user;

          // Kiểm tra chéo: Nếu trong localStorage có token Admin (lỗi cũ), ta xóa ngay
          if (userData.role === "Admin" && localStorage.getItem("token")) {
            localStorage.clear();
            sessionStorage.setItem("token", token); // Chuyển sang sessionStorage đúng chỗ
          }

          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    if (userData.role === "Admin") {
      // Admin: Lưu vào sessionStorage -> Tắt trình duyệt là mất
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", userData.role);
    } else {
      // Customer: Lưu vào localStorage -> Khởi động lại vẫn còn
      localStorage.setItem("token", token);
      localStorage.setItem("role", userData.role);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
