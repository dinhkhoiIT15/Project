import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const useAppInit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useAuth();
  const isAdminPath = location.pathname.startsWith("/admin");

  // Cuộn lên đầu trang mỗi khi chuyển route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Tự động chuyển hướng Admin từ trang chủ vào Dashboard
  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      user?.role === "Admin" &&
      location.pathname === "/"
    ) {
      navigate("/admin", { replace: true });
    }
  }, [loading, isAuthenticated, user, location.pathname, navigate]);

  return { loading, isAdminPath };
};