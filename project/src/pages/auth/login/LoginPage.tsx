import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../../services/AuthService";
import Swal from "sweetalert2";
import { AxiosError } from 'axios';
import logo from "../../../assets/images/PDU.webp";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();

  try {
    const response = await AuthService.login(username, password);
    const result = response.data;

    if (result?.token) {
      AuthService.setToken(result.token);

      console.log("Login successful, token set."); // Log 1

      const user = await AuthService.getUserInfo(); // decode từ token

      console.log("User Info:", user); // Log 2: Kiểm tra dữ liệu user
      console.log("User Roles:", user?.roles); // Log 3: Kiểm tra vai trò của user

      Swal.fire({ icon: "success", title: "Success", text: "Login successful" });

      // Phân quyền và điều hướng
      if (user && user.roles && user.roles.includes("STUDENT")) {
        console.log("Navigating to student dashboard (/)."); // Log 4
        navigate("/"); // Điều hướng đến trang chính (cho sinh viên)
      } else {
        console.log("Navigating to manager dashboard (/manager/welcome)."); // Log 5
        navigate("/manager/welcome"); // Điều hướng đến trang quản lý
      }

    } else {
      console.log("Login failed: No token received."); // Log 6
      Swal.fire({ icon: "error", title: "Error", text: "Invalid credentials" });
    }
  } catch (error) {
     if (error instanceof AxiosError) {
       console.error("Login failed:", error.response?.data || error.message);
     } else {
       console.error("An unexpected error occurred:", error);
     }
     Swal.fire({ icon: "error", title: "Error", text: "Login failed" });
  }
};
  return (

<div className="row w-100 mx-0">
  <div className="col-lg-4 mx-auto">
    <div className="auth-form-light text-left py-5 px-4 px-sm-5">
      <div className="brand-logo text-center">
            <img src={logo} alt="logo" />
          </div>
          <h4>Hello! let's get started</h4>
          <h6 className="font-weight-light">Sign in to continue.</h6>
          <form className="pt-3" onSubmit={handleLogin}>
            <div className="form-group">
              <input type="text" className="form-control form-control-lg" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <input type="password" className="form-control form-control-lg" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn">SIGN IN</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default LoginPage;