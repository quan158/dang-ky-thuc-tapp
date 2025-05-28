import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { Link } from "react-router-dom";

import { Company, Internship } from "../../../types/DataTypes";
import { getCompanyById } from "../../../services/CompanyService";
import { getInternshipsByCompanyIdAndStatus } from "../../../services/InternshipService";

// Định nghĩa URL cơ sở của backend (chỉ host và port)
const BACKEND_BASE_URL = 'http://localhost:8080';

// Định nghĩa context path của backend
const BACKEND_CONTEXT_PATH = '/project1';

const StudentCompanyDetail: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();

  const [company, setCompany] = useState<Company | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loadingCompany, setLoadingCompany] = useState<boolean>(true);
  const [loadingInternships, setLoadingInternships] = useState<boolean>(true);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [internshipError, setInternshipError] = useState<string | null>(null);

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

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) {
      setCompanyError("Không tìm thấy ID công ty.");
      setLoadingCompany(false);
      return;
    }

    setLoadingCompany(true);
    setCompanyError(null);
    try {
      const response = await getCompanyById(companyId);
      if (response && response.data) {
        setCompany(response.data);
      } else {
        setCompanyError("Không tìm thấy thông tin công ty.");
      }
    } catch (err) {
      console.error("Error fetching company details", err);
      let errorMessage = "Đã xảy ra lỗi khi lấy chi tiết công ty.";
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;
        
        if (status === 401) {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        } else if (status === 403) {
          errorMessage = "Bạn không có quyền xem thông tin công ty này.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy công ty.";
        } else if (data && typeof data === 'object' && 'message' in data) {
          errorMessage = data.message as string;
        }
      }
      
      Swal.fire({
        title: "Lỗi!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
      
      setCompanyError(errorMessage);
      setCompany(null);
    } finally {
      setLoadingCompany(false);
    }
  }, [companyId, navigate]);

  const fetchCompanyInternships = useCallback(async () => {
    if (!companyId) {
      setInternshipError("Không tìm thấy ID công ty.");
      setLoadingInternships(false);
      return;
    }

    setLoadingInternships(true);
    setInternshipError(null);
    try {
      const response = await getInternshipsByCompanyIdAndStatus(companyId);
      if (response && response.data && Array.isArray(response.data)) {
        setInternships(response.data);
      } else {
        console.error("Unexpected data format from getInternshipsByCompanyId:", response);
        setInternships([]);
      }
    } catch (err) {
      console.error("Error fetching internships", err);
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách thực tập.";
      
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        } else if (status === 403) {
          errorMessage = "Bạn không có quyền xem danh sách thực tập.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy đợt thực tập nào.";
        }
      }
      
      setInternshipError(errorMessage);
      setInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  }, [companyId, navigate]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    if (company) {
      fetchCompanyInternships();
    }
  }, [company, fetchCompanyInternships]);

  if (loadingCompany || loadingInternships) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {companyError}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning" role="alert">
          Không tìm thấy thông tin công ty.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Internship Cards - Left Side */}
        <div className="col-md-8">
          <h3 className="mb-4">Các vị trí thực tập</h3>
          {internshipError ? (
            <div className="alert alert-danger" role="alert">
              {internshipError}
            </div>
          ) : internships.length === 0 ? (
            <div className="alert alert-info">
              Hiện tại không có vị trí thực tập nào.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {internships.map((internship) => (
                <div key={internship.internshipID} className="col">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{internship.position}</h5>
                      <p className="card-text mb-2">
                        <b>Số lượng tuyển:</b> {internship.recruitmentQuantity}
                      </p>
                      <p className="card-text mb-2">
                        <b>Mô tả:</b> {internship.description && internship.description.length > 100
                          ? internship.description.slice(0, 100) + '...'
                          : internship.description}
                      </p>
                    </div>
                    <div className="card-footer bg-transparent border-top-0">
                      <Link to={`/student/internship/${internship.internshipID}`} className="btn btn-primary w-100">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Company Information - Right Side */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title mb-4">Thông tin công ty</h3>
              {company?.avatar && (
                <div className="text-center mb-4">
                  <img
                    src={typeof company.avatar === 'string' ? getFullAvatarUrl(company.avatar) : ''}
                    alt={company.companyName}
                    className="img-fluid rounded"
                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                  />
                </div>
              )}
              <h4 className="mb-3">{company.companyName}</h4>
              <div className="mb-3">
                <p className="mb-2">
                  <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                  <strong>Địa chỉ:</strong> {company.address || 'Chưa cập nhật'}
                </p>
                <p className="mb-2">
                  <i className="fas fa-phone me-2 text-primary"></i>
                  <strong>Điện thoại:</strong> {company.phone || 'Chưa cập nhật'}
                </p>
                {company.companyWebsite && (
                  <p className="mb-2">
                    <i className="fas fa-globe me-2 text-primary"></i>
                    <strong>Website:</strong>{' '}
                    <a 
                      href={company.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-decoration-none"
                    >
                      {company.companyWebsite}
                    </a>
                  </p>
                )}
              </div>
              <button 
                className="btn btn-secondary w-100"
                onClick={() => navigate('/student/companies')}
              >
                Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCompanyDetail; 