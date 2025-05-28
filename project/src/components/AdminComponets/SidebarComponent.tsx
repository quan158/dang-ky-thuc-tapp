import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getMyCompany } from "../../services/CompanyService";
import Swal from 'sweetalert2';
import AuthService from "../../services/AuthService";
import { Role } from "../../types/StatusEnum";
import { Account } from "../../types/DataTypes";


interface SidebarProps {
  isSidebarIconOnly: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarIconOnly }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleStudentApply = async () => {
    if (!user || !user.accountID) {
      Swal.fire({
        icon: 'warning',
        title: 'Yêu cầu xác thực',
        text: 'Người dùng chưa xác thực hoặc thiếu mã tài khoản.',
      });
      return;
    }

    try {
      const response = await getMyCompany();
      const company = response.data;

      if (company && company.companyID) {
        navigate(`/manager/application/list/${company.companyID}`);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Từ chối truy cập',
          text: 'Không tìm thấy công ty cho tài khoản của bạn hoặc bạn không có quyền truy cập.',
        });
        navigate("/403-forbidden");
      }
    } catch (error) {
      console.error("Không thể lấy thông tin công ty:", error);

      if (error instanceof Error) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: `Không thể lấy thông tin công ty: ${error.message}`,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Đã xảy ra lỗi không xác định khi lấy thông tin công ty.',
        });
      }
      navigate("/403-forbidden");
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await AuthService.getUserInfo();

        if (!userInfo) {
          navigate("/login");
          return;
        } else {
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to fetch user.");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);


  if (loading) {
    return null;
  }

  if (error) {
    console.error("Sidebar Render Error:", error);
    return null;
  }

  const hasRole = (role: Role) => user?.roles?.includes(role);


  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/manager/welcome">
            <i className="icon-grid menu-icon"></i>
            <span className="menu-title">Bảng điều khiển</span>
          </NavLink>
        </li>

        {/* Items for HR_STAFF */}
        {hasRole(Role.HR_STAFF) && (
          <>
            <li className="nav-item">
              <NavLink className="nav-link" to="/manager/company/company-profile">
                <i className="icon-grid menu-icon"></i>
                <span className="menu-title">Hồ sơ công ty</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/manager/internship/list">
                <i className="icon-grid menu-icon"></i>
                <span className="menu-title">Danh sách thực tập</span>
              </NavLink>
            </li>
             <li className="nav-item">
               <NavLink className="nav-link" to="/manager/application/list">
                 <i className="icon-grid menu-icon" onClick={handleStudentApply}></i>
                 <span className="menu-title">Sinh viên đã ứng tuyển</span>
               </NavLink>
             </li>
             <li className="nav-item">
               <NavLink className="nav-link" to="/manager/approved-internships">
                 <i className="icon-grid menu-icon"></i>
                 <span className="menu-title">Thực tập đã duyệt</span>
               </NavLink>
             </li>
          </>
        )}

        {/* Items for STAFF and ADMIN */}
        {(hasRole(Role.STAFF) || hasRole(Role.ADMIN)) && (
          <>
            <li className="nav-item">
              <a
                className="nav-link"
                data-bs-toggle="collapse"
                href="#company-submenu"
                role="button"
                aria-expanded="false"
                aria-controls="company-submenu"
              >
                <i className="icon-briefcase menu-icon"></i>
                <span className="menu-title">Công ty & Thực tập</span>
                <i className="menu-arrow"></i>
              </a>
              <div className="collapse" id="company-submenu">
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/manager/companies">
                      Danh sách công ty
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/manager/company-posts">
                      Đăng tuyển thực tập
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link" to="/manager/application/approved">
                      Sinh viên thực tập
                    </NavLink>
                  </li>
                </ul>
              </div>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/manager/proposal/list">
                <i className="icon-grid menu-icon"></i>
                <span className="menu-title">Đơn thực tập</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/manager/student/list">
                <i className="icon-grid menu-icon"></i>
                <span className="menu-title">Quản lý sinh viên</span>
              </NavLink>
            </li>
          </>
        )}

        {/* Items for ADMIN only */}
        {hasRole(Role.ADMIN) && (
          <li className="nav-item">
            <NavLink className="nav-link" to="/manager/account/list">
              <i className="icon-grid menu-icon"></i>
              <span className="menu-title">Quản lý tài khoản</span>
            </NavLink>
          </li>
        )}

      </ul>
    </nav>
  );
};

export default Sidebar;
