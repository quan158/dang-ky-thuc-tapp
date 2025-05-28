import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplicationByStudentId, deleteApplication } from "../../../services/ApplicationService";
import { ApplicationResponse } from "../../../types/DataTypes";
import AuthService from "../../../services/AuthService";
import { getStudentByAccountId } from "../../../services/StudentService";
import Swal from "sweetalert2";

const MyApply: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const account = await AuthService.getUserInfo(); 
      if (account) {
        const student = await getStudentByAccountId(account.accountID);
        if (student.data) {
          // Log student data for debugging
          console.log('Student data:', student.data);
          const response = await getApplicationByStudentId(student.data.studentID);
          setApplications(response.data);
        } else {
          setError("Không tìm thấy thông tin sinh viên.");
        }
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Không thể tải danh sách đơn ứng tuyển. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (applicationId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Bạn có chắc chắn?',
        text: "Bạn không thể hoàn tác sau khi xóa!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Có, xóa nó!',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        await deleteApplication(applicationId);
        await fetchApplications();
        Swal.fire(
          'Đã xóa!',
          'Đơn ứng tuyển của bạn đã được xóa.',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      Swal.fire(
        'Lỗi!',
        'Không thể xóa đơn ứng tuyển.',
        'error'
      );
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      case 'pending':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending':
        return 'Đang chờ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Đơn ứng tuyển của tôi</h3>
            {applications.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/student/internships')}
              >
                Tìm việc thực tập
              </button>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="alert alert-info">
              Bạn chưa có đơn ứng tuyển nào.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="thead-dark">
                  <tr>
                    <th scope="col">Vị trí</th>
                    <th scope="col">Công ty</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Ngày ứng tuyển</th>
                    <th scope="col">Ngày duyệt</th>
                    <th scope="col" className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.applicationID}>
                      <td>{application.internship?.position}</td>
                      <td>{application.internship?.companyResponse?.companyName}</td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                      </td>
                      <td>{new Date(application.appliedAt).toLocaleDateString()}</td>
                      <td>
                        {application.approvedAt ? (
                          new Date(application.approvedAt).toLocaleDateString()
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-inverse-primary btn-icon mr-2"
                          onClick={() => navigate(`/student/internship/${application.internship?.internshipID}`)}
                          title="Xem chi tiết"
                        >
                          <i className="ti-eye"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-inverse-danger btn-icon"
                          onClick={() => handleDelete(application.applicationID)}
                          title="Xóa đơn"
                        >
                          <i className="ti-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApply; 