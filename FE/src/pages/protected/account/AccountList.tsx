import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "react-bootstrap";
import Pagination from "../../../components/common/Pagination";
import { Account } from "../../../types/DataTypes";
import { useNavigate } from "react-router-dom";
import { Role, Status } from "../../../types/StatusEnum";
import { getAllAccounts, deleteAccount } from "../../../services/AccountService";
import { getStudentByAccountId, deleteStudent } from "../../../services/StudentService";
import Swal from "sweetalert2";
import AuthService from "../../../services/AuthService";

const AccountList: React.FC = () => {
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [filteredData, setFilteredData] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const navigate = useNavigate();

  const statusOptions = Object.values(Status).map((status) => ({
    value: status,
    label: status,
  }));

  const roleOptions = Object.values(Role).map((role) => ({
    value: role,
    label: role,
  }));

  const fetchAllData = async () => {
    try {
      if (AuthService.isTokenExpired()) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
        return;
      }
      setLoading(true);
      const response = await getAllAccounts();
      if (Array.isArray(response.data)) {
        setAccountsData(response.data);
      } else {
        setError("Invalid data format received.");
        setAccountsData([]);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to fetch accounts");
      setAccountsData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let tempData = [...accountsData];

    if (selectedRole) {
      tempData = tempData.filter((account) =>
        account.roles?.includes(selectedRole)
      );
    }

    if (selectedStatus) {
      const status = selectedStatus.toLowerCase();
      tempData = tempData.filter((account) =>
        (account.status ?? "").toLowerCase() === status
      );
    }

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      tempData = tempData.filter((account) =>
        (account.username ?? "").toLowerCase().includes(keyword) ||
        (account.fullname ?? "").toLowerCase().includes(keyword) ||
        (account.email ?? "").toLowerCase().includes(keyword)
      );
    }

    setFilteredData(tempData);
    setPageNumber(1); // reset về trang đầu tiên mỗi khi lọc
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [accountsData, selectedRole, selectedStatus, searchKeyword]);

  const handleDelete = async (accountId: string, username: string) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: `Bạn có muốn xóa tài khoản ${username} và thông tin sinh viên liên quan không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        // First, try to get and delete the associated student
        try {
          const studentResponse = await getStudentByAccountId(accountId);
          if (studentResponse.data && studentResponse.data.studentID) {
            await deleteStudent(studentResponse.data.studentID);
          }
        } catch (err) {
          // If student not found or already deleted, continue with account deletion
          console.log("No associated student found or already deleted");
        }

        // Then delete the account
        await deleteAccount(accountId);
        Swal.fire(
          'Đã xóa!',
          'Tài khoản và thông tin sinh viên đã được xóa thành công.',
          'success'
        );
        fetchAllData(); // Refresh the list
      } catch (err: any) {
        let errorMessage = err.response?.data?.message || err.message || "Không thể xóa tài khoản.";
        errorMessage = err.response?.data?.message || errorMessage;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const displayedAccounts = filteredData.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  return (
    <div id="InternshipList" className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Account List</h4>
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <div className="d-flex">
                {/* Select Role */}
                <Select
                  options={roleOptions}
                  placeholder="Select Role"
                  onChange={(selectedOption) =>
                    setSelectedRole(selectedOption ? selectedOption.value : "")
                  }
                  isClearable
                  className="h-46px mr-2"
                />
                {/* Select Status */}
                <Select
                  options={statusOptions}
                  placeholder="Select Status"
                  onChange={(selectedOption) =>
                    setSelectedStatus(
                      selectedOption ? selectedOption.value : ""
                    )
                  }
                  isClearable
                  className="h-46px mr-2"
                />
                {/* Search Input */}
                <div style={{ marginRight: "0.5rem", width: "200px" }}>
                  <input
                    type="text"
                    placeholder="Enter something..."
                    className="form-control"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
              </div>
              {/* Add New Button */}
              <div>
                <Button
                  className="btn btn-primary"
                  onClick={() => navigate("/manager/account/create")}
                >
                  Add New
                </Button>
              </div>
            </div>

            {/* Loading, Error, Data */}
            {loading ? (
              <p>Loading accounts...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                {displayedAccounts.length > 0 ? (
                  <div className="table-responsive pt-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Username</th>
                          <th>Fullname</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedAccounts.map((account, index) => (
                          <tr key={account.accountID}>
                            <td>
                              {index + 1 + (pageNumber - 1) * pageSize}
                            </td>
                            <td>{account.username}</td>
                            <td>{account.fullname}</td>
                            <td>{account.email}</td>
                            <td>
                              {account.roles ? account.roles.join(", ") : ""}
                            </td>
                            <td>{account.status}</td>
                            <td>
                              <Button
                                type="button"
                                className="btn btn-inverse-info btn-icon"
                                style={{ marginRight: "0.5rem" }}
                                onClick={() => navigate(`/manager/account/detail/${account.accountID}`)}
                              >
                                <i className="ti-pencil-alt"></i>
                              </Button>

                              <Button
                                type="button"
                                className="btn btn-inverse-danger btn-icon"
                                onClick={() => handleDelete(account.accountID, account.username)}
                              >
                                <i className="ti-trash"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-warning">No Account available.</p>
                )}
              </>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-end mt-4">
                <Pagination
                  pageCurrent={pageNumber}
                  totalPage={totalPages}
                  paginate={setPageNumber}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
