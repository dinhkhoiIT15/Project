import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const useLogin = (onLoginSuccess) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/login", formData);
      const { user, access_token } = response.data;

      // Gọi hàm login từ Context để lưu thông tin
      login(user, access_token);

      // Kiểm tra Role, nếu là Admin thì ép chuyển hướng vào Dashboard
      if (user.role === "Admin") {
        navigate("/admin");
      } else if (onLoginSuccess) {
        onLoginSuccess(user.role);
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    errorMsg,
    handleSubmit,
  };
};

export default useLogin;