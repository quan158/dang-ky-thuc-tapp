import { Outlet } from "react-router-dom";
import HeaderComponent from "../../components/StudentComponets/HeaderComponent";
import "../../assets/css/studentPage.css"


// import "./_variables.scss"
// import "./_vertical-wrapper.scss"
// import "../defaultLayout.scss";

const StudentLayout: React.FC = () => {
    return (
        <div className=" min-h-screen flex flex-col">
            <HeaderComponent />
            <Outlet />
        </div>
    );
};

export default StudentLayout;