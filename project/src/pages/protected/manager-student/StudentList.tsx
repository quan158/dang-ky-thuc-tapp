import React, { useEffect, useState, useMemo } from "react";
import { Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import { getAllStudents, deleteStudent } from "../../../services/StudentService";
import { Student } from "../../../types/DataTypes";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [classroomFilter, setClassroomFilter] = useState<string>("");
  const [classrooms, setClassrooms] = useState<string[]>([]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getAllStudents();
      setStudents(response.data);
      const uniqueClassrooms = Array.from(new Set(response.data.map((s) => s.classroom)));
      setClassrooms(uniqueClassrooms);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch students.";
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: errorMessage,
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.studentCode.toLowerCase().includes(term) ||
          s.fullname.toLowerCase().includes(term) ||
          s.major.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    if (classroomFilter) {
      filtered = filtered.filter((s) => s.classroom === classroomFilter);
    }

    return filtered;
  }, [students, searchTerm, statusFilter, classroomFilter]);

  const exportToExcel = () => {
    const dataToExport = filteredStudents.map((student) => ({
      "Mã sinh viên": student.studentCode,
      "Họ và tên": student.fullname,
      "Chuyên ngành": student.major,
      "Lớp": student.classroom,
      "Ngày sinh": new Date(student.dateOfBirth).toLocaleDateString("vi-VN"),
      "Email": student.email,
      "CV": student.cv,
      "Trạng thái": student.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSinhVien");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "DanhSachSinhVien.xlsx");
  };

  const handleViewDetails = (student: Student) => {
    Swal.fire({
      title: "Student Details",
      html: `
        <div style="font-family: Arial; color: #333; padding: 20px;">
          <h5 style="color: #007BFF; font-weight: bold;">Student Information</h5>
          <div><strong>Student Code:</strong> ${student.studentCode}</div>
          <div><strong>Full Name:</strong> ${student.fullname}</div>
          <div><strong>Major:</strong> ${student.major}</div>
          <div><strong>CV:</strong> ${
            student.cv
              ? `<a href="${student.cv}" target="_blank" rel="noopener noreferrer" style="color: #007BFF;">View CV</a>`
              : "Không có"
          }</div>
          <div><strong>Address:</strong> ${student.address}</div>
          <div><strong>Email:</strong> ${student.email}</div>
          <div><strong>Status:</strong> ${student.status}</div>
        </div>
      `,
      confirmButtonText: "Close",
      width: "600px",
    });
  };

  const handleEdit = (student: Student) => {
    navigate(`/manager/student/edit/${student.studentID}`);
  };

  const handleDelete = async (student: Student) => {
    if (!student.studentID) {
      Swal.fire("Lỗi!", "Không thể xóa sinh viên: ID không hợp lệ.", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: `Xóa sinh viên ${student.fullname} (${student.studentCode})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, xóa!",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteStudent(student.studentID);
        Swal.fire("Đã xóa!", "Sinh viên đã được xóa.", "success");
        fetchStudents();
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Không thể xóa sinh viên.";
        Swal.fire("Lỗi", errorMessage, "error");
      }
    }
  };

  const statusMap: Record<string, { label: string; variant: string }> = {
    APPROVED: { label: "Đồng ý", variant: "success" },
    REJECTED: { label: "Từ chối", variant: "danger" },
    PENDING: { label: "Chờ", variant: "warning" },
    COMPLETED: { label: "Hoàn thành", variant: "info" },
    NOT_REGISTER: { label: "Chưa đăng ký", variant: "secondary" },
  };

  const getStatusBadge = (status: string) => {
    const { label, variant } = statusMap[status] || { label: status, variant: "secondary" };
    return <Badge bg={variant}>{label}</Badge>;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="row" id="Student-List">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Danh sách sinh viên</h4>

            <Form as={Row} className="mb-3">
              <Col md={2}>
                <Form.Control
                  as="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="NOT_REGISTER">Chưa đăng ký</option>
                  <option value="APPROVED">Đồng ý</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="PENDING">Chờ</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </Form.Control>
              </Col>
              <Col md={2}>
                <Form.Control
                  as="select"
                  value={classroomFilter}
                  onChange={(e) => setClassroomFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">Tất cả lớp</option>
                  {classrooms.map((classroom, idx) => (
                    <option key={idx} value={classroom}>
                      {classroom}
                    </option>
                  ))}
                </Form.Control>
              </Col>
              <Col md={5}>
                <Form.Control
                  type="text"
                  placeholder="Tìm mã, tên, chuyên ngành hoặc email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={3} className="d-flex justify-content-end">
                <Button variant="primary" onClick={() => navigate("/manager/student/add")} className="me-2">
                  Thêm sinh viên
                </Button>
                <Button variant="success" onClick={exportToExcel}>
                  Xuất Excel
                </Button>
              </Col>
            </Form>

            {loading ? (
              <div className="d-flex justify-content-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : currentItems.length > 0 ? (
              <>
                <div className="table-responsive pt-3">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Mã sinh viên</th>
                        <th>Họ và tên</th>
                        <th>Chuyên ngành</th>
                        <th>Lớp</th>
                        <th>Ngày sinh</th>
                        <th>Email</th>
                        <th>CV</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((student, index) => (
                        <tr key={student.studentID || index}>
                          <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                          <td>{student.studentCode}</td>
                          <td>{student.fullname}</td>
                          <td>{student.major}</td>
                          <td>{student.classroom}</td>
                          <td>{new Date(student.dateOfBirth).toLocaleDateString("vi-VN")}</td>
                          <td>{student.email}</td>
                          <td>
                            {student.cv ? (
                              <a href={student.cv} target="_blank" rel="noopener noreferrer" className="text-primary">
                                Xem CV
                              </a>
                            ) : (
                              <span className="text-muted">Không có</span>
                            )}
                          </td>
                          <td>{getStatusBadge(student.status)}</td>
                          <td>
                            <Button className="btn-icon btn-inverse-info me-2" onClick={() => handleViewDetails(student)}>
                              <i className="ti-eye"></i>
                            </Button>
                            <Button className="btn-icon btn-inverse-info me-2" onClick={() => handleEdit(student)}>
                              <i className="ti-pencil-alt"></i>
                            </Button>
                            <Button className="btn-icon btn-inverse-danger" onClick={() => handleDelete(student)}>
                              <i className="ti-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredStudents.length > itemsPerPage && (
                  <div className="d-flex justify-content-end mt-4">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                          <button className="page-link" onClick={() => paginate(number)}>
                            {number}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-warning">Không có sinh viên nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
