import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { Company } from "../../../types/DataTypes";
import { getAllCompanies } from "../../../services/CompanyService";

// Định nghĩa URL cơ sở của backend (chỉ host và port)
const BACKEND_BASE_URL = 'http://localhost:8080';

// Định nghĩa context path của backend
const BACKEND_CONTEXT_PATH = '/project1';

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchAllCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the service function to get all companies
      const data = await getAllCompanies(); // Call service

      if (data && Array.isArray(data)) {
         setCompanies(data); // Update state with the received array of companies
      } else {
         console.error("Unexpected data format from getAllCompanies:", data);
         throw new Error("Invalid data format received.");
      }

    } catch (err) {
      console.error("Error fetching all companies:", err);
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách công ty.";
       if (axios.isAxiosError(err)) {
           console.error("Axios error details:", {
               message: err.message,
               code: err.code,
               status: err.response?.status,
               statusText: err.response?.statusText,
               data: err.response?.data,
               config: err.config,
           });
            if (err.response?.status === 404) {
                 errorMessage = "Không tìm thấy danh sách công ty.";
             } else if (err.response?.status === 401 || err.response?.status === 403) {
                  errorMessage = "Bạn không có quyền xem danh sách này.";
             } else if (err.response) {
                 if (typeof err.response.data === 'string') {
                     errorMessage = `Lỗi từ máy chủ: ${err.response.data}`;
                 } else if (err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                      errorMessage = `Lỗi từ máy chủ: ${(err.response.data ).message}`;
                 } else {
                      errorMessage = `Lỗi từ máy chủ (Mã lỗi: ${err.response.status}).`;
                 }
             } else if (err.request) {
                 errorMessage = "Không nhận được phản hồi từ máy chủ. Backend có đang chạy không?";
             } else {
                 errorMessage = `Đã xảy ra lỗi bất ngờ: ${err.message}`;
             }
        } else if (err instanceof Error) {
             errorMessage = `Đã xảy ra lỗi bất ngờ: ${err.message}`;
        } else {
             errorMessage = `Đã xảy ra lỗi không xác định: ${err}`;
        }
         Swal.fire("Lỗi!", errorMessage, "error");
         setError(errorMessage);
         setCompanies([]); // Clear the list on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCompanies();
  }, [fetchAllCompanies]);

  const filteredCompanies = companies.filter(company =>
    (company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

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
          <span className="visually-hidden">Loading...</span>
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
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col">
          <h2>Danh sách công ty</h2>
        </div>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm công ty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="alert alert-info">
          Không tìm thấy công ty nào phù hợp với tìm kiếm của bạn.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredCompanies.map((company) => (
            <div key={company.companyID} className="col">
              <div className="card h-100 shadow-sm">
                {company.avatar && (
                  <img
                    src={typeof company.avatar === 'string' ? getFullAvatarUrl(company.avatar) : ''}
                    className="card-img-top"
                    alt={company.companyName}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{company.companyName}</h5>
                  <p className="card-text">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {company.address || 'Chưa cập nhật địa chỉ'}
                  </p>
                  <p className="card-text">
                    <i className="fas fa-phone me-2"></i>
                    {company.phone || 'Chưa cập nhật số điện thoại'}
                  </p>
                  {company.companyWebsite && (
                    <p className="card-text">
                      <i className="fas fa-globe me-2"></i>
                      <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        {company.companyWebsite}
                      </a>
                    </p>
                  )}
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <Link to={`/student/company/${company.companyID}`} className="btn btn-primary w-100">
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

export default CompanyList; 