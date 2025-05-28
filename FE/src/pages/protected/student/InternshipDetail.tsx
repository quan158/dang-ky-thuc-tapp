import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { Internship, Student } from "../../../types/DataTypes";
import { getInternshipById } from "../../../services/InternshipService";
import { createApplication } from "../../../services/ApplicationService";
import { getStudentByAccountId } from "../../../services/StudentService";
import AuthService from "../../../services/AuthService";

// Định nghĩa URL cơ sở của backend (chỉ host và port)
const BACKEND_BASE_URL = 'http://localhost:8080';

// Định nghĩa context path của backend
const BACKEND_CONTEXT_PATH = '/project1';

interface InternshipDetailInfoProps {
  internship: Internship;
}

const InternshipDetailInfo: React.FC<InternshipDetailInfoProps> = ({ internship }) => (
  <div className="card shadow-sm mb-4">
    <div className="card-body">
      <h5 className="card-title mb-3" style={{textAlign: 'left'}}>Thông tin thực tập</h5>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Số lượng tuyển:</b> {internship.recruitmentQuantity}</div>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Vị trí:</b> {internship.position}</div>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Công ty:</b> {internship.companyResponse?.companyName || "N/A"}</div>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Mô tả:</b></div>
      <div className="mb-2" style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{internship.description || "N/A"}</div>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Yêu cầu:</b></div>
      <div className="mb-2" style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{internship.requirement || "N/A"}</div>
      <div className="mb-2" style={{textAlign: 'left'}}><b>Quyền lợi:</b></div>
      <div className="mb-2" style={{textAlign: 'left', whiteSpace: 'pre-line'}}>{internship.benefits || "N/A"}</div>
    </div>
  </div>
);

const InternshipDetail: React.FC = () => {
  const { internshipId } = useParams<{ internshipId: string }>();
  const navigate = useNavigate();

  const [internship, setInternship] = useState<Internship | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!internshipId) {
        setError("Không tìm thấy ID thực tập");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch internship details
        const internshipResponse = await getInternshipById(internshipId);
        setInternship(internshipResponse.data);

        // Fetch current student's data
        const userData = await AuthService.getUserInfo();
        if (userData?.accountID) {
          const studentResponse = await getStudentByAccountId(userData.accountID);
          setStudent(studentResponse.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        let errorMessage = "Không thể tải thông tin thực tập.";
        
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          const data = err.response?.data;
          console.log("Dữ liệu lỗi:", data);
          if (status === 401) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
          } else if (status === 404) {
            errorMessage = "Không tìm thấy thông tin thực tập.";
          } else if (status === 403) {
            errorMessage = "Bạn không có quyền xem thông tin thực tập này.";
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [internshipId, navigate]);

  const handleApply = async () => {
    if (!internship || !student) {
      Swal.fire("Lỗi", "Thiếu thông tin cần thiết để ứng tuyển.", "error");
      return;
    }

    try {
      setApplying(true);
      await createApplication(internship.internshipID);

      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Bạn đã ứng tuyển thành công.",
      }).then(() => {
        navigate('/applyList'); // Chuyển sang danh sách đơn đã ứng tuyển
      });
    } catch (err) {
      console.error("Lỗi khi ứng tuyển:", err);
      let errorMessage = "Ứng tuyển không thành công.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.log("Dữ liệu lỗi:", data);
        if (status === 401) {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        } else if (data) {
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (typeof data === 'object') {
            if ('message' in data && typeof data.message === 'string') {
              errorMessage = data.message;
            } else {
              errorMessage = JSON.stringify(data);
            }
          }
        }
      }
      Swal.fire("Lỗi", errorMessage, "error");
    } finally {
      setApplying(false);
    }
  };

  // Helper function to construct the full image URL
  const getFullAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (!avatarPath || typeof avatarPath !== 'string') {
      return ''; // Return empty string or a placeholder if no avatar path
    }

    // Nếu avatarPath đã là URL đầy đủ, sử dụng nó
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath;
    }

    // Kết hợp base URL, context path và đường dẫn avatar
    const baseUrl = BACKEND_BASE_URL.endsWith('/') ? BACKEND_BASE_URL.slice(0, -1) : BACKEND_BASE_URL;
    const contextPath = BACKEND_CONTEXT_PATH.startsWith('/') ? BACKEND_CONTEXT_PATH : '/' + BACKEND_CONTEXT_PATH;
    const cleanedAvatarPath = avatarPath.startsWith('/') ? avatarPath.slice(1) : avatarPath;

    return `${baseUrl}${contextPath}/${cleanedAvatarPath}`;
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

  if (!internship) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Không tìm thấy thông tin thực tập.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <InternshipDetailInfo internship={internship} />
        </div>
        <div className="col-md-4">
          {internship.companyResponse && (
            <Link to={`/student/company/${internship.companyResponse.companyID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card shadow-sm p-3 d-flex flex-column align-items-center justify-content-center">
                {internship.companyResponse.avatar && (
                  <div className="text-center mb-3">
                    <img
                      src={typeof internship.companyResponse.avatar === 'string' ? getFullAvatarUrl(internship.companyResponse.avatar) : ''}
                      alt="Company Avatar"
                      style={{ 
                        width: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain', 
                        borderRadius: '8px',
                        marginBottom: '15px'
                      }}
                    />
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: 18 }}>{internship.companyResponse.companyName}</div>
                <div style={{ fontSize: 14, color: '#555' }}>{internship.companyResponse.address}</div>
                {internship.companyResponse.companyWebsite && (
                  <div style={{ fontSize: 14 }}>
                    <span
                      style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={e => {
                        e.stopPropagation();
                        window.open(
                          internship.companyResponse.companyWebsite.startsWith('http')
                            ? internship.companyResponse.companyWebsite
                            : `http://${internship.companyResponse.companyWebsite}`,
                          '_blank'
                        );
                      }}
                    >
                      {internship.companyResponse.companyWebsite}
                    </span>
                  </div>
                )}
                <div className="mt-2">
                  <span className="badge bg-info text-dark">Xem công ty</span>
                </div>
              </div>
            </Link>
          )}
          {student && student.cv && (
            <div className="mt-3">
              <button
                className="btn btn-primary w-100"
                onClick={handleApply}
                disabled={applying}
              >
                {applying ? "Đang ứng tuyển..." : "Ứng tuyển ngay"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-8">
          {!student ? (
            <div className="alert alert-warning w-100">
              Vui lòng hoàn thiện hồ sơ trước khi ứng tuyển.
              <button 
                className="btn btn-primary mt-3 w-100"
                onClick={() => navigate('/student/profile')}
              >
                Hoàn thiện hồ sơ
              </button>
            </div>
          ) : !student.cv ? (
            <div className="alert alert-warning w-100">
              Vui lòng tải lên CV trước khi ứng tuyển.
              <button 
                className="btn btn-primary mt-3 w-100"
                onClick={() => navigate('/student/profile')}
              >
                Tải lên CV
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail; 