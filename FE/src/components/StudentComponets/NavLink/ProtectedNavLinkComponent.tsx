import { Link, NavLink, useNavigate } from "react-router-dom";
import avatar from "../../../assets/images/faces/face28.jpg";
import AuthService from "../../../services/AuthService";

function ProtectedNavLinkComponent() {
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    return (
        <ul id="studentPage" className="navbar-nav">
            <li className="nav-item d-flex align-items-center">
                <NavLink to="/" className="nav-link">
                    Trang chủ
                </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
                <NavLink to="/student/internships" className="nav-link">
                    Cơ hội thực tập
                </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
                <NavLink to="/student/companies" className="nav-link">
                    Danh sách công ty
                </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
                <NavLink to={`/proposals`} className="nav-link">
                    Đơn thực tập
                </NavLink>
            </li>
            <li className="nav-item d-flex align-items-center">
                <NavLink to="/applyList" className="nav-link">
                    Đơn ứng tuyển
                </NavLink>
            </li>
            <li className="nav-item nav-profile dropdown d-flex align-items-center">
                <a
                    className="nav-link dropdown-toggle"
                    href=""
                    data-toggle="dropdown"
                    id="profileDropdown"
                >
                    <img src={avatar} className="" alt="profile" width="40" height="40" />
                </a>
                <div
                    className="dropdown-menu dropdown-menu-right navbar-dropdown"
                    aria-labelledby="profileDropdown"
                >
                    <Link className="dropdown-item" to="/student/profile">
                        <i className="mr-2 ti-user text-primary"></i>
                        Hồ sơ
                    </Link>
                    <a
                        className="dropdown-item"
                        onClick={handleLogout}
                        style={{ cursor: "pointer" }}
                    >
                        <i className="mr-2 ti-shift-left text-primary"></i>
                        Đăng xuất
                    </a>
                </div>
            </li>
        </ul>
    );
}

export default ProtectedNavLinkComponent;