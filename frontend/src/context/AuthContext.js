import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");

      if (token) {
        try {
          const res = await api.get("/user/profile");
          const userData = res.data.user;

          // Chuyển token Admin từ localStorage sang sessionStorage nếu bị lưu sai
          if (userData.role === "Admin" && localStorage.getItem("token")) {
            localStorage.clear();
            sessionStorage.setItem("token", token);
          }

          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          // Xóa tĩnh lặng nếu token lỗi
          sessionStorage.clear();
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token) => {
    if (userData.role === "Admin") {
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("role", userData.role);
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem("role", userData.role);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Lưu lại token tạm thời để gọi API
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    // 1. XÓA BỘ NHỚ NGAY LẬP TỨC
    sessionStorage.clear();
    localStorage.clear();

    // 2. Hủy state React
    setUser(null);
    setIsAuthenticated(false);

    // 3. Gọi API logout ngầm
    if (token) {
      api.post("/logout").catch(() => {});
    }

    // 4. Ép trình duyệt xóa cache state và thay thế URL hiện tại bằng trang chủ
    // Dùng replace thay vì href để user không thể nhấn nút Back quay lại trang Admin
    window.location.replace("/");
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
