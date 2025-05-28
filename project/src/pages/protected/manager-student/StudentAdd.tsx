import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import { createStudent } from "../../../services/StudentService";
import { Student } from "../../../types/DataTypes";
import Swal from "sweetalert2";

const StudentAdd: React.FC = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Omit<Student, "studentID" | "createAt" | "accountId">>({
    studentCode: "",
    fullname: "",
    major: "",
    cv: "",
    address: "",
    status: "NOT_REGISTER",
    email: "",
    classroom: "",
    dateOfBirth: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createStudent(student);
      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Thêm sinh viên thành công',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/manager/student/list');
      });
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || "Không thể thêm sinh viên",
        confirmButtonText: 'OK'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setStudent({
      ...student,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="row">
      <div className="col-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <h4 className="card-title">Thêm sinh viên mới</h4>
            <form className="forms-sample" onSubmit={handleSubmit}>
              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Mã sinh viên</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="studentCode"
                    value={student.studentCode}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mã sinh viên"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Họ và tên</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="fullname"
                    value={student.fullname}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Chuyên ngành</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="major"
                    value={student.major}
                    onChange={handleChange}
                    required
                    placeholder="Nhập chuyên ngành"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Email</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="email"
                    name="email"
                    value={student.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Lớp</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="classroom"
                    value={student.classroom}
                    onChange={handleChange}
                    required
                    placeholder="Nhập lớp"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Ngày sinh</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={student.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Địa chỉ</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="address"
                    value={student.address}
                    onChange={handleChange}
                    required
                    placeholder="Nhập địa chỉ"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>CV</Form.Label>
                <Col sm={9}>
                  <Form.Control
                    type="text"
                    name="cv"
                    value={student.cv}
                    onChange={handleChange}
                    placeholder="Nhập link CV"
                  />
                </Col>
              </Form.Group>

              <Form.Group as={Row} className="mb-3">
                <Form.Label column sm={3}>Trạng thái</Form.Label>
                <Col sm={9}>
                  <Form.Select
                    name="status"
                    value={student.status}
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{
                      width: '100%',
                      padding: '0.375rem 0.75rem',
                      fontSize: '1rem',
                      fontWeight: '400',
                      lineHeight: '1.5',
                      color: '#495057',
                      backgroundColor: '#fff',
                      backgroundClip: 'padding-box',
                      border: '1px solid #ced4da',
                      borderRadius: '0.25rem',
                      transition: 'border-color .15s ease-in-out,box-shadow .15s ease-in-out',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3e%3c/svg%3e")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px 12px'
                    }}
                  >
                    <option value="NOT_REGISTER">Chưa đăng ký</option>
                    <option value="APPROVED">Đồng ý</option>
                    <option value="REJECTED">Từ chối</option>
                    <option value="PENDING">Chờ</option>
                    <option value="COMPLETED">Hoàn thành</option>
                  </Form.Select>
                </Col>
              </Form.Group>

              <div className="d-flex justify-content-end gap-2">
                <Button variant="secondary" onClick={() => navigate('/manager/student/list')}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit">
                  Thêm
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAdd; 