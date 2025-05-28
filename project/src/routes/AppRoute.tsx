import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedLayouts from "../layouts/defautlLayout/DefaultLayout"; // Assuming DefaultLayout is the protected layout
import StudentLayout from "../layouts/defautlLayout/StudentLayout"; // Assuming StudentLayout is for student-specific public/protected pages
import AuthLayouts from "../layouts/authLayout/AuthLayouts";
import ProtectedRoute from "./ProtectedRoute";
import AccountDetail from "../pages/protected/account/AccountDetail";
import { Role } from "../types/StatusEnum"; // Import Role enum
import ErrorLayout from "../layouts/errorLayout/ErrorLayout"; // Import ErrorLayout

// Import page components
import LoginPage from "../pages/auth/login/LoginPage";
import { ForbiddenError } from "../pages/exception/403-forbidden";
import AccountList from "../pages/protected/account/AccountList";
import CreateAccount from "../pages/protected/account/CreateAccount";
import HomeStudent from "../pages/public/Home"; // Assuming Home.tsx is the public home
import WelcomeManager from "../pages/WelcomeManager";
import InternshipList from "../pages/protected/student/InternshipList";
import InternshipCreate from "../pages/protected/internship/InternshipCreate";
import InternshipDetails from "../pages/protected/internship/InternshipDetails";
import CompanyProfile from "../pages/protected/company/CompanyProfile";
import ApplicationList from "../pages/protected/company/ApplicationList";
import ApprovedInternshipList from "../pages/protected/company/ApprovedInternshipList";
import CompanyListForManager from "../pages/protected/company/CompanyListForManager";
import CompanyDetail from "../pages/protected/company/CompanyDetail";
import ProposalList from "../pages/protected/manager-student/ProposalList";
import StudentList from "../pages/protected/manager-student/StudentList";
import StudentEdit from "../pages/protected/manager-student/StudentEdit";
import StudentAdd from "../pages/protected/manager-student/StudentAdd";
import CompanyList from '../pages/protected/student/CompanyList';
import StudentCompanyDetail from '../pages/protected/student/CompanyDetail';
import Profile from '../pages/protected/student/Profile';
import MyProposal from '../pages/protected/student/MyProposal';
import CreateProposal from '../pages/protected/student/CreateProposal';
import InternshipDetail from "../pages/protected/student/InternshipDetail";
import MyApply from '../pages/protected/student/MyApply';
import InternshipListForCompany from "../pages/protected/internship/InternshipListForCompany";
import InternshipListForStaff from "../pages/protected/internship/InternshipListForStaff";
import ApprovedStudentList from "../pages/protected/manager-student/ApprovedStudentList";

const AppRoute: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes (using StudentLayout as a base) */}
      <Route element={<StudentLayout />}>
        <Route path="/" element={<HomeStudent />} /> {/* Public Home */}
        <Route path="/student/companies" element={<CompanyList />} />
        <Route path="/student/company/:companyId" element={<StudentCompanyDetail />} />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <MyProposal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proposals/create"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <CreateProposal />
            </ProtectedRoute>
          }
        />
        <Route path="/student/internship/:internshipId" element={<InternshipDetail />} />
        <Route path="/student/internships" element={<InternshipList />} />
        <Route
          path="/applyList"
          element={
            <ProtectedRoute allowedRoles={[Role.STUDENT]}>
              <MyApply />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Login Route (using AuthLayouts) */}
      <Route element={<AuthLayouts />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes (wrapped in ProtectedLayouts) */}
      <Route element={<ProtectedLayouts />}>
        {/* Manager/Staff/Admin Welcome Page */}
        <Route
          path="/manager/welcome"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.HR_STAFF, Role.STAFF]}>
              <WelcomeManager />
            </ProtectedRoute>
          }
        />

        {/* Account Management Routes - Protected by ADMIN role */}
        <Route
          path="/manager/account/list"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AccountList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/account/detail/:accountID"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AccountDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/account/create"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <CreateAccount />
            </ProtectedRoute>
          }
        />

        {/* Internship Management Routes - Protected by HR_STAFF (COMPANY) and ADMIN roles */}
        <Route
          path="/manager/internship/list"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF, Role.ADMIN]}>
              <InternshipListForCompany />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/internship/create"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF, Role.ADMIN]}>
              <InternshipCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/internship/details/:internshipId"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF, Role.ADMIN, Role.STUDENT, Role.STAFF]}>
              <InternshipDetails mode="details" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/internship/update/:internshipId"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF, Role.ADMIN]}>
              <InternshipDetails mode="update" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/company/company-profile"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/application/list"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF]}>
              <ApplicationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/approved-internships"
          element={
            <ProtectedRoute allowedRoles={[Role.HR_STAFF]}>
              <ApprovedInternshipList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/companies"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <CompanyListForManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-detail/:companyId"
          element={
            <ProtectedRoute allowedRoles={[Role.ADMIN, Role.HR_STAFF, Role.STAFF, Role.STUDENT]}>
              <CompanyDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/proposal/list"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <ProposalList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/student/list"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <StudentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/student/edit/:id"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <StudentEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/student/add"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <StudentAdd />
            </ProtectedRoute>
          }
        />
          <Route
          path="/manager/company-posts"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <InternshipListForStaff />
            </ProtectedRoute>
          }
        />
          <Route
          path="/manager/application/approved"
          element={
            <ProtectedRoute allowedRoles={[Role.STAFF]}>
              <ApprovedStudentList />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* Error Routes (using ErrorLayout) */}
      <Route element={<ErrorLayout />}>
        <Route path="/403-forbidden" element={<ForbiddenError />} />
      </Route>

      {/* Redirect to login if no other route matches */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoute;
