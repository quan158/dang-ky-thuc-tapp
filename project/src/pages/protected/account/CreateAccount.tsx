import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// Import createAccount function from your service
import { createAccount } from "../../../services/AccountService";
// Import Swal for alerts
import Swal from "sweetalert2";
// Import AccountCreationPayload interface
import { AccountCreationPayload } from "../../../types/DataTypes";
// Import Role and Status enums
import { Role, Status } from "../../../types/StatusEnum";
import { AxiosError } from "axios";

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();

  // State variables for form inputs
  // Explicitly type the state to resolve potential type inference issues with setters
  const [role, setRole] = useState<string>(Role.ADMIN); // <-- Explicitly type as string
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [status, setStatus] = useState<string>(Status.ACTIVE); // <-- Explicitly type as string

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Tạo object dữ liệu theo AccountCreationPayload interface
    const accountData: AccountCreationPayload = {
      username,
      password,
      fullname,
      email,
      status,
      roles: [role], // <-- Gửi roles dưới dạng MẢNG để khớp với Set<String> ở backend
    };

    try {
      // Gọi service với dữ liệu kiểu AccountCreationPayload
      // Đảm bảo hàm createAccount trong AccountService.ts nhận kiểu AccountCreationPayload
      await createAccount(accountData);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Account created",
      }).then(() => {
        navigate(-1);
      });

    } catch (error: AxiosError | unknown) { // <-- Changed 'any' to 'unknown'
      let errorMessage = "Đã xảy ra lỗi không xác định.";

      // Safely check if the error is an AxiosError and has a response with a message
      if (error instanceof AxiosError && error.response && error.response.data && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data) {
          // Assuming error.response.data is an object with a 'message' property
          errorMessage = (error.response.data as { message: string }).message; // <-- Type assertion for safety
      } else if (error instanceof Error) { // Handle standard Error objects
          // Fallback to the standard error message if it's a regular Error
          errorMessage = error.message;
      } else {
          // Handle cases where the error is not an AxiosError or a standard Error
          errorMessage = "An unexpected error occurred.";
      }


      Swal.fire({
        icon: "error",
        title: "Create account fail!",
        text: errorMessage,
      });
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div id="CreateAccount" className="row">
      <div className="col-12 grid-margin">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Create account</h4>
            <form className="form-sample" onSubmit={handleSubmit}>
              {/* Username and Password row */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Username</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Password</label>
                    <div className="col-sm-9">
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full name and Email row */}
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Full name</label>
                    <div className="col-sm-9">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter full name"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                   <div className="form-group row">
                     <label className="col-sm-3 col-form-label">Email</label>
                     <div className="col-sm-9">
                       <input
                         type="email"
                         className="form-control"
                         placeholder="Enter email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         required
                       />
                     </div>
                   </div>
                 </div>
              </div>

              {/* Status and Role row */}
              <div className="row">
                 <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Status</label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                      >
                        {/* Use Status enum values */}
                        <option value={Status.ACTIVE}>{Status.ACTIVE}</option>
                        <option value={Status.INACTIVE}>{Status.INACTIVE}</option>
                        <option value={Status.BANNED}>{Status.BANNED}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group row">
                    <label className="col-sm-3 col-form-label">Role</label>
                    <div className="col-sm-9">
                      <select
                        className="form-control"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        {/* Use Role enum values */}
                        <option value={Role.ADMIN}>{Role.ADMIN}</option>
                        <option value={Role.STUDENT}>{Role.STUDENT}</option>
                        <option value={Role.HR_STAFF}>{Role.HR_STAFF}</option>
                        <option value={Role.STAFF}>{Role.STAFF}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit and Cancel buttons */}
              <button type="submit" className="btn btn-primary mr-2">
                Submit
              </button>
              <button type="button" className="btn btn-light" onClick={handleCancel}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
