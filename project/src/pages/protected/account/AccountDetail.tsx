import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccountById, updateAccount } from "../../../services/AccountService";
import Swal from "sweetalert2";
import { Account, AccountCreationPayload } from "../../../types/DataTypes";
import { Role, Status } from "../../../types/StatusEnum";
import { AxiosError } from "axios";

const AccountDetail: React.FC = () => {
  const navigate = useNavigate();
  const { accountID } = useParams<{ accountID: string }>(); // <-- Lấy accountId từ URL params

  const [role, setRole] = useState<string>(Role.ADMIN);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [status, setStatus] = useState<string>(Status.ACTIVE);

  useEffect(() => {
    if (accountID) {
      getAccountById(accountID)
        .then((response) => {
          const account: Account = response.data;
          setUsername(account.username);
          setFullname(account.fullname ? account.fullname : "");
          setPassword(account.password);
          setEmail(account.email);
          setStatus(account.status);
          setRole(account.roles[0]);
        })
        .catch((error: AxiosError | unknown) => {
          let errorMessage = "An unexpected error occurred.";

          if (error instanceof AxiosError && error.response && error.response.data && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data) {
            errorMessage = (error.response.data as { message: string }).message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }

          Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage,
          }).then(() => {
            navigate(-1);
          });
        });
    }
  }, [accountID, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!accountID) return;

    const updatedAccount: Partial<AccountCreationPayload> = {
      username,
      password: password || undefined, // Nếu không nhập thì không gửi password mới
      fullname,
      email,
      status,
      roles: [role],
    };

    try {
      await updateAccount(accountID, updatedAccount);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Account updated successfully",
      }).then(() => {
        navigate(-1);
      });

    } catch (error: AxiosError | unknown) {
      let errorMessage = "An unexpected error occurred.";

      if (error instanceof AxiosError && error.response && error.response.data && typeof error.response.data === 'object' && error.response.data !== null && 'message' in error.response.data) {
        errorMessage = (error.response.data as { message: string }).message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: "error",
        title: "Update failed!",
        text: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div id="AccountDetail" className="row">
      <div className="col-12 grid-margin">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Account Detail</h4>
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
                        placeholder="Leave blank to keep current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                Save
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

export default AccountDetail;
