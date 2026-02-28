import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  // Ưu tiên kiểm tra token trong sessionStorage trước (nơi lưu token Admin khi đăng nhập)
  let token = sessionStorage.getItem("token");

  // Nếu không có trong session (không phải admin), mới tìm ở localStorage
  if (!token) {
    token = localStorage.getItem("token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tự động làm sạch dữ liệu nếu token hết hạn (401) HOẶC tài khoản bị khóa (403)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.clear();
      sessionStorage.clear();
      if (!window.location.pathname.includes("/login"))
        window.location.href = "/"; // Ép văng về trang chủ
    }
    return Promise.reject(err);
  },
);

export default api;
