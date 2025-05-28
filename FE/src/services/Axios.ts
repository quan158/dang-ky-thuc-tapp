import axios from "axios";
import AuthService from "./AuthService";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/project1", 
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});


axiosInstance.interceptors.request.use((config) => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Kiểm tra nếu dữ liệu là FormData thì đặt lại Content-Type
  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired, attempting to refresh...");

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await axios.post("http://localhost:5028/auth/refresh", { refreshToken });
          const newToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          AuthService.setToken(newToken);
          localStorage.setItem("refreshToken", newRefreshToken); // Lưu refresh token mới

          // Cập nhật request gốc với token mới
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(error.config);
        } catch (err) {
          console.error("Refresh token failed", err);
        }
      }

      AuthService.removeToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

