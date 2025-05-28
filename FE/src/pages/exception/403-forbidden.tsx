import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Account } from "../../types/DataTypes";
import AuthService from "../../services/AuthService";
import { Role } from "../../types/StatusEnum";

export const ForbiddenError = () => {
  const [user, setUser] = useState<Account | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = await AuthService.getUserInfo();
        if (userInfo) {
          setUser(userInfo);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="row flex-grow">
      <div className="col-lg-7 mx-auto text-white">
        <div className="row align-items-center d-flex flex-row">
          <div className="col-lg-6 text-lg-right pr-lg-4">
            <h1 className="display-1 mb-0">403</h1>
          </div>
          <div className="col-lg-6 error-page-divider text-lg-left pl-lg-4">
            <h2>SORRY!</h2>
            <h3 className="font-weight-light">
              You do not have permission to access this page.
            </h3>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12 text-center mt-xl-2">
            {user?.roles.includes(Role.STUDENT) && (
              <Link className="text-light text-decoration-none" to="/">
                Back to homepage
              </Link>
            )}

            {user?.roles.includes(Role.STUDENT) && (
              <Link
                className="text-light text-decoration-none"
                to="/manager/welcome"
              >
                Back to manager homepage
              </Link>
            )}
          </div>
        </div>
        <div className="row mt-5">
          <div className="col-12 mt-xl-2">
            <p className="text-white font-weight-medium text-center">
              Copyright &copy; 2021 All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
