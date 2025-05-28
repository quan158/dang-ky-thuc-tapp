// components/ApplicationList.tsx

import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios"; // Import axios for detailed error handling
import { Link } from "react-router-dom"; // Import Link for navigation
import { Form, Row, Col } from "react-bootstrap";

import { ApplicationResponse } from "../../../types/DataTypes"; // Import ApplicationResponse interface
// Import the correct service functions
import { getApplications, updateApplicationStatus } from "../../../services/ApplicationService"; // Assuming getApplications calls GET /application/list

const ApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Function to fetch applications for the logged-in company
  const fetchCompanyApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApplications(); // Call service to get applications for the logged-in company
      setApplications(data);
    } catch (err) {
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách đơn ứng tuyển.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = "Không tìm thấy danh sách đơn ứng tuyển cho công ty của bạn.";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = "Bạn không có quyền xem danh sách này.";
        } else {
          // Attempt to get a meaningful error message from the response body
          if (typeof err.response?.data === 'string') {
              errorMessage = `Lỗi từ máy chủ: ${err.response.data}`;
          } else if (err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
               errorMessage = `Lỗi từ máy chủ: ${(err.response.data).message}`;
          } else {
               errorMessage = `Lỗi từ máy chủ (Mã lỗi: ${err.response?.status || 'Không rõ'}).`;
          }
        }
      } else {
        errorMessage = `Lỗi không xác định: ${err}`;
      }
      console.error("Error fetching company applications:", err); // Log the full error
      Swal.fire("Lỗi!", errorMessage, "error");
      setError(errorMessage);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to handle updating the status of an application
const handleUpdateStatus = async (applicationID: string | null, newStatus: string) => {
    if (!applicationID) {
        Swal.fire("Lỗi!", "Không tìm thấy ID đơn ứng tuyển.", "error");
        return;
    }

    const actionText = newStatus === "APPROVED" ? "Duyệt" : "Từ chối";

    Swal.fire({
        title: `Xác nhận ${actionText}?`,
        text: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} đơn ứng tuyển này không?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === "APPROVED" ? '#28a745' : '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Có, ${actionText}!`,
        cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
        if (result.isConfirmed) {
          try {
              await updateApplicationStatus(applicationID, newStatus);
                Swal.fire("Thành công!", `Đã cập nhật trạng thái đơn: ${newStatus}`, "success");
                setApplications(prev =>
                    prev.map(app =>
                        app.applicationID === applicationID ? { ...app, status: newStatus } : app
                    )
                );
            } catch (err) {
                let errorMessage = "Thao tác không thành công.";
                if (axios.isAxiosError(err)) {
                    if (err.response) {
                        const statusCode = err.response.status;
                        const message = err.response.data?.message || err.response.data?.error || "Không có thông báo chi tiết từ server";
                        errorMessage = `Lỗi từ máy chủ (Mã lỗi: ${statusCode}): ${message}`;
                    } else {
                        errorMessage = `Lỗi từ máy chủ: ${err.message}`;
                    }
                } else {
                    errorMessage = `Lỗi không xác định: ${err}`;
                }
                console.error("Error updating application status:", err);
                Swal.fire("Lỗi!", errorMessage, "error");
            }
        }
    });
};



  useEffect(() => {
    fetchCompanyApplications();
  }, [fetchCompanyApplications]);

  if (loading) {
    return <p>Đang tải danh sách đơn ứng tuyển...</p>;
  }

  if (error) {
    return <p className="text-danger">Lỗi: {error}</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Danh sách đơn ứng tuyển</h2>
      {/* Bộ lọc trạng thái dạng form giống ProposalList */}
      <Form as={Row} className="mb-3">
        <Col md={3}>
          <Form.Control
            as="select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Đã từ chối</option>
          </Form.Control>
        </Col>
      </Form>
      {applications.length === 0 ? (
        <p>Không có đơn ứng tuyển nào được tìm thấy cho công ty của bạn.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã Sinh viên</th>
                <th>Tên Sinh viên</th>
                <th>CV</th>
                <th>Tin tuyển dụng</th>
                <th>Ngày nộp đơn</th>
                <th>Ngày duyệt</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {applications
                .filter(app => !statusFilter || app.status === statusFilter)
                .map((app, index) => (
                // Sử dụng applicationID làm key nếu có, fallback sang kết hợp studentCode và internshipID + appliedAt
                <tr key={app.applicationID || `${app.student?.studentCode}-${app.internship?.internshipID}-${app.appliedAt}`}>
                  <td>{index + 1}</td>
                  <td>{app.student?.studentCode || 'N/A'}</td>
                  <td>{app.student?.fullname || 'N/A'}</td>
                  <td>
                     {app.student?.cv ? (
                         <a href={app.student.cv} target="_blank" rel="noopener noreferrer">Xem CV</a>
                     ) : (
                         'N/A'
                     )}
                  </td>
                  <td>
                    {/* Link to Internship Details page */}
                    {app.internship?.internshipID ? (
                       <Link to={`/manager/internship/details/${app.internship.internshipID}`}>
                         {app.internship?.position || 'N/A'}
                       </Link>
                    ) : (
                        'N/A'
                    )}
                  </td>
                  <td>
                      {app.appliedAt ? (
                          (() => { // Immediately Invoked Function Expression for date formatting
                              try {
                                  return new Date(app.appliedAt).toLocaleDateString();
                              } catch (e) {
                                  console.error("Error formatting date:", app.appliedAt, e);
                                  return 'Invalid Date'; // Return a fallback string
                              }
                          })() // Call the IIFE
                      ) : (
                          'N/A'
                      )}
                  </td>
                  <td>
                      {app.approvedAt ? (
                          (() => {
                              try {
                                  return new Date(app.approvedAt).toLocaleDateString();
                              } catch (e) {
                                  console.error("Error formatting date:", app.approvedAt, e);
                                  return 'Invalid Date';
                              }
                          })()
                      ) : (
                          'N/A'
                      )}
                  </td>
                  <td>{app.status || 'N/A'}</td>
                  <td>
                    {/* Approve Button */}
                    <button
                      className="btn btn-success btn-sm me-2" // me-2 adds margin-right
                      onClick={() => handleUpdateStatus(app.applicationID, "APPROVED")}
                      disabled={app.status === "APPROVED" || !app.applicationID}
                    >
                      Duyệt
                    </button>
                    {/* Reject Button */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleUpdateStatus(app.applicationID, "REJECTED")}
                       // Disable button if status is already REJECTED or applicationID is null
                      disabled={app.status === "REJECTED" || !app.applicationID}
                    >
                      Từ chối
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

       {/* Tích hợp phân trang và lọc ở đây nếu backend API hỗ trợ */}
    </div>
  );
};

export default ApplicationList;
