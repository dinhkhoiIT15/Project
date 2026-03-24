import { useState } from "react";
import api from "../../services/api";

const useRegister = (switchToLogin) => {
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

  return {
    formData,
    loading,
    errorMsg,
    successMsg,
    handleChange,
    handleSubmit,
  };
};

export default useRegister;