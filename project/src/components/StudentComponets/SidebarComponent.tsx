import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link" to="/student/dashboard">
            <i className="icon-grid menu-icon"></i>
            <span className="menu-title">Trang chủ</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/student/companies">
            <i className="icon-building menu-icon"></i>
            <span className="menu-title">Danh sách công ty</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/student/proposals">
            <i className="icon-document menu-icon"></i>
            <span className="menu-title">Đơn thực tập</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/student/internship-status">
            <i className="icon-check menu-icon"></i>
            <span className="menu-title">Trạng thái thực tập</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
