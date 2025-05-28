// File: ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/AuthService";
import { Account } from "../types/DataTypes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  // Use state to manage user info and loading state
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await AuthService.getUserInfo(); // Await the async function
        setUser(userInfo);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setUser(null); // Set user to null on error
      } finally {
        setLoading(false); 
      }
    };

    fetchUser();
  }, []); // Run only once on component mount

  if (loading) {
    return null; // Or return a loading spinner component
  }
  const isTokenExpired = AuthService.isTokenExpired();


  if (!user || isTokenExpired) {
    // User is not authenticated or token is expired, redirect to login
    localStorage.setItem("redirectAfterLogin", location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Check if the user has at least one of the allowed roles
  // Correct logic: check if any of the user's roles are included in allowedRoles
  const hasAllowedRole = user.roles.some(role => allowedRoles.includes(role));

  if (!hasAllowedRole) {
    return <Navigate to="/403-forbidden" replace />;
  }

  // User is authenticated, token is valid, and has an allowed role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
