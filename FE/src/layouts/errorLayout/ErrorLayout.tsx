import { Outlet } from "react-router-dom";

const ErrorLayout: React.FC = () => {
  return (
    <div className="container-scroller">
    <div className="container-fluid page-body-wrapper full-page-wrapper">
      <div className="content-wrapper d-flex align-items-center text-center error-page bg-primary">
            <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ErrorLayout;
