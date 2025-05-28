// components/CompanyDetailForManager.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

import { Company, Internship } from "../../../types/DataTypes";
import { getCompanyById } from "../../../services/CompanyService";
import { getInternshipsByCompanyId } from "../../../services/InternshipService";

const BACKEND_BASE_URL = 'http://localhost:8080';

const BACKEND_CONTEXT_PATH = '/project1';

const CompanyDetail: React.FC = () => {
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
          // Lưu URL hiện tại để redirect lại sau khi login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        } else if (status === 403) {
          errorMessage = "Bạn không có quyền xem thông tin công ty này.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy công ty.";
        } else if (data && typeof data === 'object' && 'message' in data) {
          errorMessage = data.message as string;
        } else if (status) {
          errorMessage = `Lỗi từ máy chủ: ${status}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Lỗi bất ngờ: ${err.message}`;
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
    if (!company) {
      setInternshipError("Chưa có thông tin công ty để lấy thực tập.");
      setLoadingInternships(false);
      return;
    }
    setLoadingInternships(true);
    setInternshipError(null);
    try {
      const response = await getInternshipsByCompanyId(company.companyID);
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
        const data = err.response?.data;
        
        if (status === 401) {
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        } else if (status === 403) {
          errorMessage = "Bạn không có quyền xem danh sách thực tập.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy đợt thực tập nào.";
        } else if (data && typeof data === 'object' && 'message' in data) {
          errorMessage = data.message as string;
        } else if (status) {
          errorMessage = `Lỗi từ máy chủ: ${status}`;
        }
      } else if (err instanceof Error) {
        errorMessage = `Lỗi bất ngờ: ${err.message}`;
      }

      Swal.fire({
        title: "Lỗi!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK"
      });
      
      setInternshipError(errorMessage);
      setInternships([]);
    } finally {
      setLoadingInternships(false);
    }
  }, [companyId, company, navigate]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    if (company) {
      fetchCompanyInternships();
    }
  }, [company, fetchCompanyInternships]);

  if (loadingCompany || loadingInternships) {
    return <p>Đang tải thông tin công ty và danh sách thực tập...</p>;
  }

  if (companyError) {
    return <p className="text-danger">Lỗi: {companyError}</p>;
  }

  if (!company) {
    return <p className="text-warning">Không tìm thấy thông tin công ty.</p>;
  }

  return (
    <div className="container mt-4">
      <h2>Chi tiết công ty</h2>
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Danh sách thực tập</h4>
              {internshipError ? (
                <p className="text-danger">Lỗi: {internshipError}</p>
              ) : internships.length === 0 ? (
                <p>Không có đợt thực tập nào.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Vị trí</th>
                            <th>Số lượng tuyển</th>
                            <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {internships.map((internship, index) => (
                        <tr key={internship.internshipID}>
                          <td>{index + 1}</td>
                          <td>{internship.position}</td>
                          <td>{internship.recruitmentQuantity}</td>
                          <td>{internship.status}</td>
                          <td>
                            <Link to={`/manager/internship/details/${internship.internshipID}`}>
                              <button className="btn btn-info btn-sm">Xem chi tiết</button>
                            </Link>
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

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Thông tin công ty</h4>
              {company?.avatar && (
                <div className="mb-3">
                  <img
                    src={typeof company.avatar === 'string' ? getFullAvatarUrl(company.avatar) : ''}
                    alt="Avatar"
                    style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                  />
                </div>
              )}
              <p><strong>Tên Công ty:</strong> {company.companyName}</p>
              <p><strong>Điện thoại:</strong> {company.phone}</p>
              <p><strong>Địa chỉ:</strong> {company.address}</p>
              {company.companyWebsite && (
                <p>
                  <strong>Website:</strong> <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer">{company.companyWebsite}</a>
                </p>
              )}
              <button className="btn btn-secondary mt-3" onClick={() => navigate("/manager/companies")}>
                Quay lại danh sách công ty
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
