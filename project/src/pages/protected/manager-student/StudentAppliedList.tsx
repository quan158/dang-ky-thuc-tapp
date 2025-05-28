import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Pagination from "../../../components/common/Pagination";
import { StudentApplied } from "../../../types/DataTypes";
import { fetchStudentApplied, updateApplyStatus } from "../../../services/StudentServices";
import { ApplyStatus } from "../../../types/StatusEnum";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

const StudentAppliedList: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [students, setStudents] = useState<StudentApplied[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch applied students
  useEffect(() => {
    if (companyId) {
      fetchStudents();
    }
  }, [companyId, pageNumber, searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentApplied(
        Number(companyId),
        pageNumber,
        pageSize,
        searchTerm
      );
      if (data && data.items) {
        setStudents(data.items);
        setTotalPages(data.totalPages);
      } else {
        throw new Error("Invalid data format.");
      }
    } catch (err) {
      setError("Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (studentId: number, applyId: number, status: ApplyStatus) => {
    const result = await Swal.fire({
      title: "Xác nhận",
      text: `Bạn có chắc muốn ${status === ApplyStatus.APPROVED ? 'duyệt' : 'từ chối'} đơn này?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await updateApplyStatus(studentId, applyId, status);
        Swal.fire("Thành công", `Đã ${status === ApplyStatus.APPROVED ? 'duyệt' : 'từ chối'} đơn.`, "success");
        fetchStudents();
      } catch (error) {
        Swal.fire("Lỗi", "Không thể cập nhật trạng thái đơn.", "error");
      }
    }
  };

  return (
    <div className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Danh sách sinh viên đã ứng tuyển</h4>

            {/* Tìm kiếm */}
            <div className="d-flex justify-content-between mb-3 align-items-center">
              <div className="d-flex">
                <div className="mr-2">
                  <input
                    type="text"
                    placeholder="Tìm theo mã sinh viên..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={fetchStudents}>
                  Tìm kiếm
                </button>
              </div>
            </div>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : students.length > 0 ? (
              <div className="table-responsive pt-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã sinh viên</th>
                      <th>Chuyên ngành</th>
                      <th>Địa chỉ</th>
                      <th>CV</th>
                      <th>Trạng thái</th>
                      <th>Vị trí thực tập</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.studentId}>
                        <td>{index + 1 + (pageNumber - 1) * pageSize}</td>
                        <td>{student.studentCode}</td>
                        <td>{student.major}</td>
                        <td>{student.address}</td>
                        <td>
                          <a
                            href={`/uploads/${student.cvImage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-info btn-sm"
                          >
                            Xem CV
                          </a>
                        </td>
                        <td className={`status ${student.applyStatus}`}>
                          {student.applyStatus === ApplyStatus.PENDING && "Chờ duyệt"}
                          {student.applyStatus === ApplyStatus.APPROVED && "Đã duyệt"}
                          {student.applyStatus === ApplyStatus.REJECTED && "Đã từ chối"}
                        </td>
                        <td>{student.internshipPosition}</td>
                        <td>
                          {student.applyStatus === ApplyStatus.PENDING && (
                            <div>
                              <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() =>
                                  handleUpdateStatus(student.studentId, student.applyId, ApplyStatus.APPROVED)
                                }
                              >
                                Duyệt
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(student.studentId, student.applyId, ApplyStatus.REJECTED)
                                }
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-warning">Không tìm thấy sinh viên nào.</p>
            )}

            {/* Phân trang */}
            <div className="d-flex justify-content-end mt-4">
              <Pagination
                pageCurrent={pageNumber}
                totalPage={totalPages}
                paginate={setPageNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAppliedList;
