import React, { useEffect, useState } from "react";
import { Button, Form, Row, Col, Badge } from "react-bootstrap";
import Pagination from "../../../components/common/Pagination";
import { getAllProposals, updateProposalStatus } from "../../../services/ProposalService";
import { Proposal } from "../../../types/DataTypes";
import Swal from "sweetalert2";
import { ApplyStatus } from "../../../types/StatusEnum";


const ProposalList: React.FC = () => {
  const [proposalData, setProposalData] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [studentCodeSearch, setStudentCodeSearch] = useState<string>("");

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const response = await getAllProposals();
      let proposals = response.data;

      // Filter by status
      if (statusFilter) {
        proposals = proposals.filter((p) => p.status === statusFilter);
      }
      // Filter by student code
      if (studentCodeSearch) {
        proposals = proposals.filter((p) =>
          p.studentResponse.studentCode?.toLowerCase().includes(studentCodeSearch.toLowerCase())
        );
      }

      setProposalData(proposals);
      setTotalPages(Math.ceil(proposals.length / pageSize));
    } catch (err) {
      setError("Failed to fetch proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, [pageNumber, pageSize, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ApplyStatus.PENDING:
        return <Badge bg="warning">Chờ duyệt</Badge>;
      case ApplyStatus.APPROVED:
        return <Badge bg="success">Đã duyệt</Badge>;
      case ApplyStatus.REJECTED:
        return <Badge bg="danger">Đã từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleApprove = async (proposal: Proposal) => {
    const result = await Swal.fire({
      title: "Xác nhận duyệt",
      text: `Bạn có chắc chắn muốn duyệt proposal của sinh viên ${proposal.studentResponse.studentCode}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Duyệt",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#28a745",
    });

    if (result.isConfirmed) {
      try {
        await updateProposalStatus(proposal.proposalID, ApplyStatus.APPROVED); // Chỉ gửi status
        Swal.fire("Thành công", "Đã duyệt proposal!", "success");
        fetchAllData();
      } catch {
        Swal.fire("Lỗi", "Không thể duyệt proposal!", "error");
      }
    }
  };


    const handleReject = async (proposal: Proposal) => {
    const result = await Swal.fire({
      title: "Xác nhận từ chối",
      text: `Bạn có chắc chắn muốn từ chối proposal của sinh viên ${proposal.studentResponse.studentCode}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await updateProposalStatus(proposal.proposalID, ApplyStatus.REJECTED); // Chỉ gửi status
        Swal.fire("Thành công", "Đã từ chối proposal!", "success");
        fetchAllData();
      } catch {
        Swal.fire("Lỗi", "Không thể từ chối proposal!", "error");
      }
    }
  };


 const handleViewDetails = (proposal: Proposal) => {
  Swal.fire({
    title: `Proposal Details`,
    html: `
      <div style="font-family: 'Arial', sans-serif; color: #333; padding: 20px;">
        <h5 style="color: #007BFF; font-weight: bold;">Proposal Information</h5>
        <div style="margin-bottom: 10px;">
          <strong>Job Position:</strong> <span>${proposal.jobPosition}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Company Name:</strong> <span>${proposal.companyName}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Task Description:</strong> <span>${proposal.taskDescription}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Employee Size:</strong> <span>${proposal.employeeSize}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Tax Number:</strong> <span>${proposal.taxNumber}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Website:</strong> <a href="${proposal.websiteUrl}" target="_blank" rel="noopener noreferrer" style="color: #007BFF;">${proposal.websiteUrl}</a>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>HR Email:</strong> <span>${proposal.hrMail}</span>
        </div>

        <h5 style="color: #007BFF; font-weight: bold; margin-top: 20px;">Student Information</h5>
        <div style="margin-bottom: 10px;">
          <strong>Student Code:</strong> <span>${proposal.studentResponse.studentCode}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Full Name:</strong> <span>${proposal.studentResponse.fullname}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Major:</strong> <span>${proposal.studentResponse.major}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>CV:</strong> <a href="${proposal.studentResponse.cv}" target="_blank" rel="noopener noreferrer" style="color: #007BFF;">Download CV</a>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Address:</strong> <span>${proposal.studentResponse.address}</span>
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Status:</strong> <span>${proposal.studentResponse.status}</span>
        </div>
      </div>
    `,
    showCloseButton: false,
    confirmButtonText: 'Close',
    width: '600px',
    customClass: {
      popup: 'custom-swal-popup',
    }
  });
};

  // Pagination
  const paginatedData = proposalData.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

  return (
    <div id="Proposal-List" className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Danh sách Proposal</h4>

            {/* Filter & Search */}
            <Form as={Row} className="mb-3">
              <Col md={3}>
                <Form.Control
                  as="select"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPageNumber(1); }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={ApplyStatus.PENDING}>Chờ duyệt</option>
                  <option value={ApplyStatus.APPROVED}>Đã duyệt</option>
                  <option value={ApplyStatus.REJECTED}>Đã từ chối</option>
                </Form.Control>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo mã sinh viên"
                  value={studentCodeSearch}
                  onChange={(e) => { setStudentCodeSearch(e.target.value); setPageNumber(1); }}
                />
              </Col>
              <Col md={2}>
                <Button variant="primary" onClick={fetchAllData}>Tìm kiếm</Button>
              </Col>
            </Form>

            {loading ? (
              <p>Đang tải dữ liệu...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <>
                {paginatedData.length > 0 ? (
                  <div className="table-responsive pt-3">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Vị trí công việc</th>
                          <th>Công ty</th>
                          <th>Mã sinh viên</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((proposal, index) => (
                          <tr key={proposal.proposalID}>
                            <td>{index + 1 + (pageNumber - 1) * pageSize}</td>
                            <td>{proposal.jobPosition}</td>
                            <td>{proposal.companyName}</td>
                            <td>{proposal.studentResponse.studentCode}</td>
                            <td>{getStatusBadge(proposal.status || '')}</td>
                            <td>
                              <Button
                                variant="info"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewDetails(proposal)}
                              >
                                <i className="ti-eye"></i>
                              </Button>
                              {(!proposal.status || proposal.status === ApplyStatus.PENDING) && (
                                <>
                                  <Button
                                    variant="success"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleApprove(proposal)}
                                  >
                                    <i className="ti-check"></i>
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleReject(proposal)}
                                  >
                                    <i className="ti-close"></i>
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-warning">Không có proposal nào.</p>
                )}
              </>
            )}

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

export default ProposalList;
