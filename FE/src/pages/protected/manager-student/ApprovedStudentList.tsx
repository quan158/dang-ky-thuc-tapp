import React, { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { Button, Col, Form, Row } from "react-bootstrap";
import * as XLSX from "xlsx";

import { ApplicationResponse, Company } from "../../../types/DataTypes";
import { getStudentApplications } from "../../../services/ApplicationService";
import { getAllCompanies } from "../../../services/CompanyService";

const ApprovedStudentList: React.FC = () => {
  const [approvedApplications, setApprovedApplications] = useState<ApplicationResponse[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingApplications, setLoadingApplications] = useState<boolean>(true);
  const [errorApplications, setErrorApplications] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const fetchApprovedApplications = useCallback(async () => {
    setLoadingApplications(true);
    setErrorApplications(null);
    try {
      const data = await getStudentApplications();
      if (data && Array.isArray(data)) {
        setApprovedApplications(data);
      } else {
        Swal.fire("Lỗi!", "Định dạng dữ liệu không hợp lệ.", "error");
        setApprovedApplications([]);
      }
    } catch (err) {
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách sinh viên.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      Swal.fire("Lỗi!", errorMessage, "error");
      setErrorApplications(errorMessage);
      setApprovedApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  const fetchAllCompanies = useCallback(async () => {
    try {
      const data = await getAllCompanies();
      if (data && Array.isArray(data)) {
        setCompanies(data);
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (err) {
      let errorMessage = "Đã xảy ra lỗi khi lấy danh sách công ty.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      Swal.fire("Lỗi!", errorMessage, "error");
      setCompanies([]);
    }
  }, []);

  useEffect(() => {
    fetchApprovedApplications();
    fetchAllCompanies();
  }, [fetchApprovedApplications, fetchAllCompanies]);

  const filteredApplications = useMemo(() => {
    if (!selectedCompanyId) return approvedApplications;
    return approvedApplications.filter(app =>
      app.internship?.companyResponse?.companyID === selectedCompanyId
    );
  }, [approvedApplications, selectedCompanyId]);

  const handleExportToExcel = () => {
    const exportData = filteredApplications.map((app, index) => ({
      "#": index + 1,
      "Mã Sinh viên": app.student?.studentCode || "",
      "Tên Sinh viên": app.student?.fullname || "",
      "Ngành": app.student?.major || "",
      "Email": app.student?.email || "",
      "Công ty thực tập": app.internship?.companyResponse?.companyName || "",
      "Vị trí thực tập": app.internship?.position || "",
      "Ngày duyệt": app.approvedAt
        ? new Date(app.approvedAt).toLocaleDateString()
        : "",
      "Trạng thái đơn": app.status || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSinhVien");
    XLSX.writeFile(workbook, "DanhSachSinhVienDaDuyet.xlsx");
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách sinh viên đã duyệt thực tập</h2>

      <Form as={Row} className="mb-3 align-items-end">
        <Form.Group as={Col} md={3} controlId="companyFilter">
          <Form.Control
            as="select"
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="form-select"
          >
            <option value="">Tất cả công ty</option>
            {companies.map((company, idx) => (
              <option key={idx} value={company.companyID}>
                {company.companyName}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Col md="auto">
          <Button variant="success" onClick={handleExportToExcel}>
            Xuất Excel
          </Button>
        </Col>
      </Form>

      {filteredApplications.length === 0 ? (
        <p>Không có sinh viên nào phù hợp với bộ lọc.</p>
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
                <th>Công ty thực tập</th>
                <th>Vị trí thực tập</th>
                <th>Ngày duyệt</th>
                <th>Trạng thái đơn</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, index) => (
                <tr key={app.applicationID || index}>
                  <td>{index + 1}</td>
                  <td>{app.student?.studentCode || 'N/A'}</td>
                  <td>{app.student?.fullname || 'N/A'}</td>
                  <td>{app.student?.major || 'N/A'}</td>
                  <td>{app.student?.email || 'N/A'}</td>
                  <td>{app.internship?.companyResponse?.companyName || 'N/A'}</td>
                  <td>{app.internship?.position || 'N/A'}</td>
                  <td>
                    {app.approvedAt
                      ? new Date(app.approvedAt).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{app.status || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApprovedStudentList;
