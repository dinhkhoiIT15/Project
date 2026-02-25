import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { LogIn } from "lucide-react";

const Login = ({ onLoginSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/login", formData);
      const { user, access_token } = response.data;

      // Gọi hàm login từ Context (Hàm này sẽ tự quyết định lưu vào đâu)
      login(user, access_token);

      if (onLoginSuccess) onLoginSuccess(user.role);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in p-2">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-[#1f2328]">Welcome Back</h2>
        <p className="text-[#6e7781] text-sm mt-1 font-medium">
          Please sign in to continue
        </p>
      </div>
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold border border-red-100 text-center">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex-1 space-y-4">
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <Button type="submit" fullWidth isLoading={loading} className="py-2.5">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default Login;
