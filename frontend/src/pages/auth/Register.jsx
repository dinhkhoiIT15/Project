import React, { useState } from "react";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import api from "../../services/api";
import { UserPlus } from "lucide-react";

const Register = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    phone_number: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await api.post("/register", {
        username: formData.username,
        phone_number: formData.phone_number,
        address: formData.address,
        password: formData.password,
      });

      setSuccessMsg("Registration successful! Redirecting...");
      setTimeout(() => {
        if (switchToLogin) switchToLogin();
      }, 1500);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Registration failed. Try again!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col animate-fade-in pb-4 px-2">
      <div className="flex items-center justify-center gap-3 mb-6 mt-2">
        <div className="bg-[#1a7f37]/10 p-2.5 rounded-full flex items-center justify-center">
          <UserPlus size={24} className="text-[#1a7f37]" />
        </div>
        <h2 className="text-2xl font-black text-[#1f2328]">Create account</h2>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-[#fff8f7] text-[#cf222e] rounded-md text-xs font-bold border border-[#ffdce0] text-center">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-[#dafbe1] text-[#1a7f37] rounded-md text-xs font-bold border border-[#a6f3a6] text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col w-full">
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          label="Phone Number"
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
        <Input
          label="Delivery Address"
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            className="py-3 text-[15px]"
          >
            Sign Up
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6 text-sm">
        <span className="text-[#1f2328] font-medium">Have an account?</span>
        <button
          onClick={switchToLogin}
          type="button"
          className="text-[#0969da] hover:underline font-bold transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

export default Register;
