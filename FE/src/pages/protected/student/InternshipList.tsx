import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { Internship } from "../../../types/DataTypes";
import { fetchInternships } from "../../../services/InternshipService";
import AuthService from "../../../services/AuthService";

// Định nghĩa URL cơ sở của backend (chỉ host và port)
const BACKEND_BASE_URL = 'http://localhost:8080';

// Định nghĩa context path của backend
const BACKEND_CONTEXT_PATH = '/project1';

const InternshipList: React.FC = () => {
  const navigate = useNavigate();
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");

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

  const fetchInternshipData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kiểm tra token trước khi gọi API
      if (AuthService.isTokenExpired()) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
        return;
      }

      const response = await fetchInternships();
      if (response && Array.isArray(response)) {
        setAllInternships(response);
        setInternships(response);
      } else {
        setAllInternships([]);
        setInternships([]);
        setError("Định dạng dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error("Error fetching internships:", err);
      let errorMessage = "Không thể tải danh sách thực tập.";
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          // Chỉ chuyển hướng nếu token hết hạn
          if (AuthService.isTokenExpired()) {
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
          }
        }
        errorMessage = err.response?.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: errorMessage,
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternshipData();
  }, []);

  // Filter internships on client side when searchKeyword changes
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setInternships(allInternships);
    } else {
      const keyword = searchKeyword.toLowerCase();
      setInternships(
        allInternships.filter(internship =>
          internship.position.toLowerCase().includes(keyword)
        )
      );
    }
  }, [searchKeyword, allInternships]);

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
          <h4 className="alert-heading">Lỗi!</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-primary"
            onClick={() => fetchInternshipData()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <h2>Danh sách thực tập</h2>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm vị trí thực tập..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {internships.length === 0 ? (
        <div className="alert alert-info">
          Hiện không có vị trí thực tập nào.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {internships.map((internship) => (
            <div key={internship.internshipID} className="col">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    {internship.companyResponse?.avatar && (
                      <img
                        src={typeof internship.companyResponse.avatar === 'string' ? getFullAvatarUrl(internship.companyResponse.avatar) : ''}
                        alt={internship.companyResponse.companyName}
                        className="me-3"
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    )}
                    <div>
                      <h5 className="card-title mb-0">{internship.position}</h5>
                      <small className="text-muted">{internship.companyResponse?.companyName}</small>
                    </div>
                  </div>
                  <p className="card-text">
                    <i className="fas fa-users me-2"></i>
                    Số lượng: {internship.recruitmentQuantity}
                  </p>
                  <p className="card-text text-truncate">
                    <i className="fas fa-file-alt me-2"></i>
                    {internship.description}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Link 
                    to={`/student/internship/${internship.internshipID}`}
                    className="btn btn-primary w-100"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InternshipList; 