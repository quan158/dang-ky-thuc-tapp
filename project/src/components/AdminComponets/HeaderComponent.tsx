import React from "react";
import logo from "../../assets/images/PDU.webp";  // Đảm bảo đường dẫn đúng đến logo
import AuthService from "../../services/AuthService"; // Đảm bảo AuthService đã được tạo sẵn
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await AuthService.logout(); // Gọi hàm logout từ AuthService
      Swal.fire({
        icon: 'success',
        title: 'Logout Successful',
        text: 'You have successfully logged out.',
      });

      navigate("/"); // Chuyển về trang chủ (home) sau khi logout thành công
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
      });
    }
  };

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <a className="navbar-brand brand-logo mr-5" href="/">
          <img src={logo} className="mr-2" alt="logo" />
        </a>
        <a className="navbar-brand brand-logo-mini" href="/">
          <img src={logo} alt="logo" />
        </a>
      </div>

      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button
          className="navbar-toggler navbar-toggler align-self-center"
          type="button"
          onClick={onToggleSidebar}
        >
          <span className="icon-menu"></span>
        </button>

        <ul className="navbar-nav navbar-nav-right">
          {/* Thanh menu người dùng */}
          <li className="nav-item nav-profile dropdown">
            <a
              className="nav-link dropdown-toggle"
              href="#"
              data-toggle="dropdown"
              id="profileDropdown"
            >
              <img
                src="https://res.cloudinary.com/dt9hjydap/image/upload/v1731182417/hrrx6nnwuvrxbaqlacne.jpg"
                alt="profile"
              />
            </a>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown"
              aria-labelledby="profileDropdown"
            >
              <a className="dropdown-item">
                <i className="ti-settings text-primary"></i>
                Settings
              </a>
              <a className="dropdown-item" onClick={handleLogout}>
                <i className="ti-power-off text-primary"></i>
                Logout
              </a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
