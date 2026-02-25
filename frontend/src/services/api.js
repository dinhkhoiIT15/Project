import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Lấy token từ sessionStorage (Admin) hoặc localStorage (Customer)
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động làm sạch dữ liệu nếu token hết hạn (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      if (!window.location.pathname.includes("/login"))
        window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export default api;
