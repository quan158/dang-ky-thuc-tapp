import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProposal } from '../../../services/ProposalService';
import AuthService from '../../../services/AuthService';
import { getStudentByAccountId } from '../../../services/StudentService';

const CreateProposal = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        companyName: '',
        companyLogo: '',
        employeeSize: '',
        address: '',
        location: '',
        taxNumber: '',
        websiteUrl: '',
        hrName: '',
        hrMail: '',
        taskDescription: '',
        jobPosition: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<any>(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const account = await AuthService.getUserInfo();
                if (account) {
                    const student = await getStudentByAccountId(account.accountID);
                    if (student.data) {
                        console.log('Student data:', student.data);
                        setStudentData(student.data);
                    }
                }
            } catch (err) {
                console.error('Error fetching student data:', err);
            }
        };

        fetchStudentData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentData) {
            setError('Không tìm thấy thông tin sinh viên. Vui lòng thử lại sau.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createProposal({
                ...formData,
                studentResponse: {
                    studentCode: studentData.studentCode,
                    fullname: studentData.fullname,
                    major: studentData.major,
                    cv: studentData.cv,
                    address: studentData.address,
                    status: studentData.status,
                    createAt: studentData.createAt,
                    classroom: studentData.classroom,
                    dateOfBirth: studentData.dateOfBirth,
                    accountResponse: {
                        accountID: studentData.accountId,
                        username: studentData.username,
                        email: studentData.email,
                        fullname: studentData.fullname,
                        createAt: studentData.createAt,
                        status: studentData.status,
                        roles: studentData.roles || []
                    }
                }
            });
            navigate('/proposals');
        } catch (err: any) {
            console.error('Lỗi khi tạo đơn thực tập:', err);
            let errorMessage = 'Không thể tạo đơn thực tập. Vui lòng thử lại sau.';
            
            if (err.response) {
                if (err.response.data && err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.status === 400) {
                    errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
                } else if (err.response.status === 401) {
                    errorMessage = 'Bạn cần đăng nhập để thực hiện thao tác này.';
                } else if (err.response.status === 403) {
                    errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
                } else if (err.response.status === 415) {
                    errorMessage = 'Định dạng dữ liệu không được hỗ trợ. Vui lòng thử lại.';
                }
            } else if (err.request) {
                errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Tạo đơn thực tập mới</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="ti-alert me-2"></i>
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Tên công ty <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Logo công ty (URL)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="companyLogo"
                                                value={formData.companyLogo}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Quy mô nhân viên <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="employeeSize"
                                                value={formData.employeeSize}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Vị trí <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Mã số thuế <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="taxNumber"
                                                value={formData.taxNumber}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Website</label>
                                            <input
                                                type="url"
                                                className="form-control"
                                                name="websiteUrl"
                                                value={formData.websiteUrl}
                                                onChange={handleChange}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Tên người phụ trách <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="hrName"
                                                value={formData.hrName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Email người phụ trách <span className="text-danger">*</span></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="hrMail"
                                                value={formData.hrMail}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Vị trí thực tập <span className="text-danger">*</span></label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="jobPosition"
                                                value={formData.jobPosition}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Mô tả công việc <span className="text-danger">*</span></label>
                                            <textarea
                                                className="form-control"
                                                name="taskDescription"
                                                value={formData.taskDescription}
                                                onChange={handleChange}
                                                rows={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/proposals')}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            'Tạo đơn thực tập'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateProposal; 