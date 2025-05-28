import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";

import { ApplicationResponse } from "../../../types/DataTypes"; // Assuming you have this type
import { getApprovedApplications, updateApplicationStatus } from "../../../services/ApplicationService"; // New service function

const ApprovedInternshipList: React.FC = () => {
  const [approvedApplications, setApprovedApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovedApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getApprovedApplications(); // Call the new service
      if (data && Array.isArray(data)) {
        setApprovedApplications(data);
      } else {
        console.error("Unexpected data format from getApprovedApplications:", data);
        throw new Error("Invalid data format received.");
      }
    } catch (err) {
      console.error("Error fetching approved applications:", err);
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách sinh viên đã được duyệt.";
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          errorMessage = "Không tìm thấy danh sách.";
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          errorMessage = "Bạn không có quyền xem danh sách này. Vui lòng đăng nhập lại.";
        } else if (err.response) {
          errorMessage = typeof err.response.data === 'string'
            ? `Lỗi từ máy chủ: ${err.response.data}`
            : `Lỗi từ máy chủ (Mã lỗi: ${err.response.status}).`;
        } else if (err.request) {
          errorMessage = "Không nhận được phản hồi từ máy chủ.";
        } else {
          errorMessage = `Đã xảy ra lỗi bất ngờ: ${err.message}`;
        }
      }
      Swal.fire("Lỗi!", errorMessage, "error");
      setError(errorMessage);
      setApprovedApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovedApplications();
  }, [fetchApprovedApplications]);

const handleConfirmCompletion = async (applicationID: string | undefined) => {
  if (!applicationID) return;

  const result = await Swal.fire({
    title: "Xác nhận",
    text: "Bạn có chắc muốn xác nhận hoàn thành đơn này?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy"
  });

  if (result.isConfirmed) {
    try {
      await updateApplicationStatus(applicationID, "COMPLETED");
      Swal.fire("Thành công!", "Đã cập nhật trạng thái thành COMPLETED.", "success");
      fetchApprovedApplications(); // Refresh the list
    } catch (err) {
      console.error("Error updating status:", err);
      Swal.fire("Lỗi!", "Không thể cập nhật trạng thái. Vui lòng thử lại.", "error");
    }
  }
};


  if (loading) return <p>Đang tải danh sách sinh viên đã được duyệt...</p>;

  if (error) return <p className="text-danger">Lỗi: {error}</p>;

  return (
    <div className="container mt-4">
      <h2>Danh sách sinh viên đã duyệt thực tập</h2>

      {approvedApplications.length === 0 ? (
        <p>Không có sinh viên nào đã được duyệt thực tập.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Mã Sinh viên</th>
                <th>Tên Sinh viên</th>
                <th>Ngành</th>
                <th>Email</th>
                <th>Vị trí thực tập</th>
                <th>Ngày duyệt</th>
                <th>Trạng thái đơn</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {approvedApplications.map((app, index) => (
                <tr key={app.applicationID || index}>
                  <td>{index + 1}</td>
                  <td>{app.student?.studentCode || 'N/A'}</td>
                  <td>{app.student?.fullname || 'N/A'}</td>
                  <td>{app.student?.major || 'N/A'}</td>
                  <td>{app.student?.email || app.student?.email || 'N/A'}</td>
                  <td>{app.internship?.position || 'N/A'}</td>
                  <td>
                    {app.approvedAt
                      ? (() => {
                          try {
                            return new Date(app.approvedAt).toLocaleDateString();
                          } catch (e) {
                            console.error("Error formatting date:", app.approvedAt, e);
                            return 'Invalid Date';
                          }
                        })()
                      : 'N/A'}
                  </td>
                  <td>{app.status || 'N/A'}</td>
                  <td>
                    <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleConfirmCompletion(app.applicationID)}
                    disabled={!app.applicationID || app.status === "COMPLETED"}
                    >
                    Xác nhận hoàn thành
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApprovedInternshipList;
