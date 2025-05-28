import { Link } from "react-router-dom";
import ProtectedNavLinkComponent from "./NavLink/ProtectedNavLinkComponent";
import PublicNavLinkComponent from "./NavLink/PublicNavLinkComponent";
import logo from "../../assets/images/PDU.webp";
import { useEffect, useState } from "react";
import AuthService from "../../services/AuthService";
import { Account } from "../../types/DataTypes";

// Tạo một event bus toàn cục để truyền thông báo giữa các component
export const authEvents = {
  logout: new Event("auth-logout"),
  login: new Event("auth-login"),
};

function Header() {
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    // Hàm để cập nhật thông tin user dựa trên accessToken
    const updateUserInfo = async () => {
      const userInfo = await AuthService.getUserInfo();
      setUser(userInfo); // Bây giờ userInfo có kiểu Account | null
    };

    // Gọi ngay lần đầu để đảm bảo state ban đầu chính xác
    updateUserInfo();

    // Tạo một interval để kiểm tra token định kỳ
    const intervalId = setInterval(updateUserInfo, 5000); // Kiểm tra mỗi 5 giây

    // Lắng nghe sự kiện window storage cho các thay đổi từ tab khác
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key === "accessToken" || event.key === null) {
        updateUserInfo();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    // Lắng nghe các sự kiện auth tùy chỉnh
    const handleLogout = () => {
      console.log("Logout event detected in HeaderComponent");
      setUser(null);
    };
    const handleLogin = () => updateUserInfo();

    window.addEventListener("auth-logout", handleLogout);
    window.addEventListener("auth-login", handleLogin);

    // Override các phương thức localStorage để phát ra sự kiện khi thay đổi
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (key === "accessToken") {
        updateUserInfo();
      }
    };

    localStorage.removeItem = function (key) {
      originalRemoveItem.call(this, key);
      if (key === "accessToken") {
        // Khi token bị xóa, đặt user về null ngay lập tức
        setUser(null);
      }
    };

    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageEvent);
      window.removeEventListener("auth-logout", handleLogout);
      window.removeEventListener("auth-login", handleLogin);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <div className="text-center bg-light navbar-brand-wrapper d-flex align-items-center justify-content-center">
          <Link className="navbar-brand brand-logo mr-5" to="/">
            <img src={logo} className="mr-2" alt="logo" />
          </Link>
          <Link className="navbar-brand brand-logo-mini" to="/">
            <img src="../../../images/logo-mini.svg" alt="logo" />
          </Link>
        </div>
        <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
          {user == null ? (
            <PublicNavLinkComponent />
          ) : (
            <ProtectedNavLinkComponent />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;