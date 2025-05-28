import { Account } from "../types/DataTypes";
import { getAccountByUsername } from "./AccountService";
import axiosInstance from "./Axios";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  iss: string;  // Issuer
  sub: string;  // Subject (username)
  exp: number;  // Expiration time (timestamp)
  iat: number;  // Issued at (timestamp)
  scope: string; // User roles or permissions (e.g., "STUDENT ADMIN")
}

const AuthService = {
  // Lấy token từ localStorage
  getToken: (): string | null => localStorage.getItem("accessToken"),

  // Lưu token vào localStorage
  setToken: (token: string) => localStorage.setItem("accessToken", token),

  // Xóa token khỏi localStorage
  removeToken: () => localStorage.removeItem("accessToken"),

  // Giải mã token JWT và trả về payload
  decodeToken: (): JwtPayload | null => {
    const token = AuthService.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token) as JwtPayload;
    } catch {
      return null;
    }
  },

  // Lấy thông tin người dùng từ token
getUserInfo: async (): Promise<Account | null> => {
  try {
    const response = await getAccountByUsername();
    const data = response.data;

    if (data) {
      return data as Account;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch account info:", error);
    return null;
  }
  },

  // Kiểm tra token đã hết hạn chưa
  isTokenExpired: (): boolean => {
    const decoded = AuthService.decodeToken();
    return decoded ? decoded.exp * 1000 < Date.now() : true;
  },

  // Đăng nhập và lấy token
  login: (username: string, password: string) =>
    axiosInstance.post("/auth/login", { username, password }),

  // Đăng xuất
  logout: () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");  // Nếu bạn lưu refresh token, cũng cần xóa
    console.log("Logout successful!");
  },

  // Làm mới token (sử dụng refresh token nếu có)
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await axiosInstance.post("/auth/refresh", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      AuthService.setToken(accessToken);
      localStorage.setItem("refreshToken", newRefreshToken);  // Lưu lại refresh token mới
      return accessToken;
    } catch (error) {
      console.error("Refresh token failed", error);
      AuthService.removeToken();  // Xóa token khi refresh không thành công
      window.location.href = "/login";  // Điều hướng đến trang đăng nhập
      return null;
    }
  },
};

export default AuthService;
