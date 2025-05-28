import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios"; // Import axios for detailed error handling
import { Link } from "react-router-dom"; // Import Link for navigation

import { Company } from "../../../types/DataTypes"; // Import CompanyResponse interface
import { getAllCompanies } from "../../../services/CompanyService"; // Import the service function

const CompanyListForManager: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Utility function to truncate long text
  const truncateText = (text: string, maxLength: number = 50): string => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Function to fetch all companies
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
  }, []); // Dependency rỗng

  // Effect hook to call fetchAllCompanies when component mounts
  useEffect(() => {
    fetchAllCompanies();
  }, [fetchAllCompanies]); // fetchAllCompanies is the only dependency

  // Render loading state
  if (loading) {
    return <p>Đang tải danh sách công ty...</p>;
  }

  // Render error state
  if (error) {
      return <p className="text-danger">Lỗi: {error}</p>;
  }

  // Render the list of companies
  return (
    <div className="container mt-4">
      <h2>Danh sách công ty</h2>

      {companies.length === 0 ? (
        <p>Không có công ty nào được tìm thấy.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên Công ty</th>
                <th>Điện thoại</th>
                <th>Địa chỉ</th>
                <th>Website</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => (
                <tr key={company.companyID}>
                  <td>{index + 1}</td>
                  <td>{company.companyName || 'N/A'}</td>
                  <td>{company.phone || 'N/A'}</td>
                  <td>{truncateText(company.address || '')}</td>
                  <td>
                      {company.companyWebsite ? (
                          <a href={company.companyWebsite} target="_blank" rel="noopener noreferrer">{company.companyWebsite}</a>
                      ) : (
                          'N/A'
                      )}
                  </td>
                  <td>
                    {company && (
                         <Link to={`/company-detail/${company.companyID}`}>
                             <button className="btn btn-info btn-sm">Xem chi tiết</button>
                         </Link>
                    )}
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

export default CompanyListForManager;
