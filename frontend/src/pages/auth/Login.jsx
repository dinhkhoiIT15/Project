import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom"; // MỚI: Import useNavigate

const Login = ({ onLoginSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate(); // MỚI: Khởi tạo navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/login", formData);
      const { user, access_token } = response.data;

      login(user, access_token);

      // MỚI: Kiểm tra Role, nếu là Admin thì ép chuyển hướng vào Dashboard
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

  return (
    <div className="flex w-full flex-col animate-fade-in pb-4 px-2">
      <div className="flex flex-col items-center justify-center mb-6 mt-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="bg-[#0969da]/10 p-2.5 rounded-full flex items-center justify-center">
            <LogIn size={24} className="text-[#0969da]" />
          </div>
          <h2 className="text-2xl font-black text-[#1f2328]">Welcome Back</h2>
        </div>
        <p className="text-[#6e7781] text-sm font-medium text-center px-4">
          Please sign in to continue
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-[#fff8f7] text-[#cf222e] rounded-md text-xs font-bold border border-[#ffdce0] text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col w-full">
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

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="py-3 text-[15px]"
          >
            Sign In
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6 text-sm">
        <span className="text-[#1f2328] font-medium">
          Don't have an account?
        </span>
        <button
          onClick={switchToRegister}
          type="button"
          className="text-[#0969da] hover:underline font-bold transition-colors"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default Login;
