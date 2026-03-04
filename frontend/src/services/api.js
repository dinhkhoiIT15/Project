import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  let token = sessionStorage.getItem("token");

  if (!token) {
    token = localStorage.getItem("token");
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // CHỈ BẮT MÃ 401 (Unauthorized - Sai Token/Hết hạn Token) để đăng xuất
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
