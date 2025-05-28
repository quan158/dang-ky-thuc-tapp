import { Link, NavLink } from "react-router-dom"

function PublicNavLinkComponent() {
    return (
        <>
            <ul id="studentPage" className="navbar-nav ms-auto">
                <li className="nav-item">
                    <NavLink to="/" className="nav-link">
                        Trang chủ
                    </NavLink>
                </li>
                <li className="nav-item">
                    <Link to="/login" className="btn btn-primary rounded rounded-1">
                        Đăng nhập
                    </Link>
                </li>
            </ul>
        </>
    )
}
export default PublicNavLinkComponent