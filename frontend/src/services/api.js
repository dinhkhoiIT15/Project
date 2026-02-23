import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Đường dẫn tới Backend Flask
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm token vào request nếu người dùng đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
