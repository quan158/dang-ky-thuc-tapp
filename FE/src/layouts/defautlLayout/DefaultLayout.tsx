import { Outlet } from "react-router-dom";
import HeaderComponent from "../../components/AdminComponets/HeaderComponent";
import SidebarComponent from "../../components/AdminComponets/SidebarComponent";
import { useState } from "react";

// import "./_variables.scss"
// import "./_vertical-wrapper.scss"
// import "../defaultLayout.scss";

const DefaultLayout: React.FC = () => {
  const [isSidebarIconOnly, setSidebarIconOnly] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarIconOnly((prev) => !prev);
  };

  return (
    <div className={`container-scroller${isSidebarIconOnly ? ' sidebar-icon-only' : ''}`}>
      <HeaderComponent onToggleSidebar={handleToggleSidebar} />
      <div className="container-fluid page-body-wrapper">
        <SidebarComponent isSidebarIconOnly={isSidebarIconOnly} />
        <div className="main-panel">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
