import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Badge, Spinner } from "react-bootstrap";
import { fetchInternships, deleteInternship, updateInternshipStatus } from "../../../services/InternshipService";
import { Internship } from "../../../types/DataTypes";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const InternshipListForStaff: React.FC = () => {
  const [internshipData, setInternshipData] = useState<Internship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchInternshipData = async () => {
    try {
      setLoading(true);
      const response = await fetchInternships();
      if (Array.isArray(response)) {
        setInternshipData(response);
      } else {
        setInternshipData([]);
        setError("Dữ liệu không hợp lệ");
      }
    } catch (err) {
      let errorMessage = "Không thể tải danh sách thực tập.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      Swal.fire({ icon: "error", title: "Lỗi", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternshipData();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Sau khi xóa sẽ không thể khôi phục!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await deleteInternship(id);
        Swal.fire("Đã xóa!", "Thông tin thực tập đã được xóa.", "success");
        fetchInternshipData();
      } catch {
        Swal.fire("Lỗi!", "Xóa không thành công.", "error");
      }
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateInternshipStatus(id, newStatus);
      Swal.fire("Thành công!", `Đã cập nhật trạng thái thành "${newStatus}".`, "success");
      fetchInternshipData();
    } catch (err) {
      Swal.fire("Lỗi!", "Không thể cập nhật trạng thái.", "error");
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const filteredInternships = statusFilter
    ? internshipData.filter((item) => item.status === statusFilter)
    : internshipData;

  const statusMap: Record<string, { label: string; variant: string }> = {
    APPROVED: { label: "Đồng ý", variant: "success" },
    REJECTED: { label: "Từ chối", variant: "danger" },
    PENDING: { label: "Chờ", variant: "warning" },
    COMPLETED: { label: "Hoàn thành", variant: "info" },
    NOT_REGISTER: { label: "Chưa đăng ký", variant: "secondary" },
  };

  return (
    <div id="Internship-List" className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Danh sách thực tập</h4>

            <Form as={Row} className="mb-3">
              <Col md={3}>
                <Form.Control
                  as="select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ</option>
                  <option value="APPROVED">Đồng ý</option>
                  <option value="REJECTED">Từ chối</option>
                </Form.Control>
              </Col>
            </Form>

            {loading ? (
              <div className="text-center py-4"><Spinner animation="border" /></div>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : filteredInternships.length > 0 ? (
              <div className="table-responsive pt-3">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                          <th>#</th>
                          <th>Tên công ty</th>
                      <th>Vị trí</th>
                      <th>Số lượng tuyển</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInternships.map((internship, index) => (
                      <tr key={internship.internshipID}>
                        <td>{index + 1}</td>
                        <td>{ internship.companyResponse.companyName }</td>
                        <td>{truncateText(internship.position, 20)}</td>
                        <td>{internship.recruitmentQuantity}</td>
                        <td>{truncateText(internship.description, 30)}</td>
                        <td>
                          <Badge bg={statusMap[internship.status]?.variant || "secondary"}>
                            {statusMap[internship.status]?.label || internship.status}
                          </Badge>
                        </td>
                        <td>
                          <Link to={`/manager/internship/details/${internship.internshipID}`}>
                            <Button variant="info" size="sm" className="me-2" title="Xem">
                              <i className="ti-eye"></i>
                            </Button>
                          </Link>
                          <Button
                            variant="success"
                            size="sm"
                            className="me-1"
                            title="Duyệt"
                            onClick={() => handleStatusUpdate(internship.internshipID, "APPROVED")}
                          >
                            <i className="ti-check"></i>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="me-1"
                            title="Từ chối"
                            onClick={() => handleStatusUpdate(internship.internshipID, "REJECTED")}
                          >
                            <i className="ti-close"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Xóa"
                            onClick={() => handleDelete(internship.internshipID)}
                          >
                            <i className="ti-trash"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-warning">Không có thông tin thực tập.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipListForStaff;
