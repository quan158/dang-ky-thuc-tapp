import { Outlet } from "react-router-dom";

const AuthLayouts: React.FC = () => {
  
  return (
    <div className="container-scroller">
      <div className="container-fluid page-body-wrapper full-page-wrapper">
        <div className="content-wrapper d-flex align-items-center auth px-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayouts;
