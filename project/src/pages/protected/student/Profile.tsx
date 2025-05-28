import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { Account, Student } from '../../../types/DataTypes';
import AuthService from '../../../services/AuthService';
import { getStudentByAccountId, updateStudent, uploadCv } from '../../../services/StudentService';

const Profile = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [uploading, setUploading] = useState<boolean>(false);
    const [accountData, setAccountData] = useState<Account | null>(null); // Khởi tạo null
    const [studentData, setStudentData] = useState<Student | null>(null);
    const [cvData, setCvData] = useState<string>("");
    const [newCvFile, setNewCvFile] = useState<File | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Student | null>(null);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);

    // Ref để truy cập input file và reset nó
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Hàm trích xuất tên file từ URL hoặc đường dẫn.
    // LƯU Ý: Hàm này chỉ để lấy tên file hiển thị, KHÔNG dùng để tạo URL xem công khai.
    const getCvFileName = (url: string | undefined) => { // Chấp nhận undefined
        if (!url) return '';
        try {
            // Cố gắng phân tích URL để lấy tên file
            const urlObject = new URL(url);
            const pathname = urlObject.pathname;
            const parts = pathname.split('/');
            // Lấy phần cuối cùng sau dấu '/' và loại bỏ query parameters nếu có
            const filenameWithQuery = parts[parts.length - 1];
            const filenameParts = filenameWithQuery.split('?');
            return filenameParts[0];
        } catch (e) {
            // Nếu không phải URL hợp lệ (có thể là đường dẫn nội bộ như /cv/...),
            // cố gắng lấy tên file từ đường dẫn
            const parts = url.split('/');
            return parts[parts.length - 1];
        }
    };

    // Hàm lấy dữ liệu profile (thông tin tài khoản và sinh viên)
    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const userData = await AuthService.getUserInfo();
            if (!userData || !userData.accountID) { // Kiểm tra cả accountID
                console.error("User data or account ID not found.");
                setLoading(false);
                return;
            }
            setAccountData(userData);

            // Lấy thông tin sinh viên dựa trên accountID
            const response = await getStudentByAccountId(userData.accountID);
            console.log('Student API response:', response);

            // Kiểm tra nếu response.data là null hoặc undefined
            if (response.data) {
                setStudentData(response.data);
                // Lưu ý: response.data.cv phải chứa URL xem công khai từ backend
                setCvData(getCvFileName(response.data.cv)); // Chỉ lấy tên file để hiển thị
            } else {
                 setStudentData(null); // Đảm bảo studentData là null nếu không tìm thấy
                 setCvData("");
                 console.warn("No student data found for this account.");
            }

        } catch (e) {
            console.error("Failed to fetch profile data.", e);
            setStudentData(null); // Đặt studentData về null khi có lỗi
            setCvData("");
        } finally {
            setLoading(false);
        }
    }

    // Xử lý khi người dùng chọn file CV
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setNewCvFile(file);
            setUploadMessage(null); // Xóa thông báo cũ khi chọn file mới
        } else {
            setNewCvFile(null);
            setUploadMessage(null);
        }
    };

    // Xử lý khi người dùng nhấn nút tải lên CV
    const handleUploadCv = async () => {
        // Kiểm tra xem đã chọn file và có studentData hợp lệ chưa
        if (!newCvFile || !studentData?.studentID) {
            setUploadMessage("Please select a file and ensure student data is valid.");
            return;
        }

        // Kiểm tra kích thước file (ví dụ: tối đa 5MB)
        if (newCvFile.size > 5 * 1024 * 1024) {
            setUploadMessage("File size must be less than 5MB.");
            return;
        }

        // Kiểm tra loại file
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(newCvFile.type)) {
            setUploadMessage("Only PDF, DOC, and DOCX files are allowed.");
            return;
        }

        try {
            setUploading(true);
            setUploadMessage("Uploading...");

            const response = await uploadCv(studentData.studentID, newCvFile);

            if (!response || !response.data) {
                throw new Error("No response from server");
            }

            if (response.status !== 200) {
                throw new Error("Upload failed");
            }

            setUploadMessage("Upload successful!");
            setNewCvFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Cập nhật lại dữ liệu profile
            fetchProfileData();

        } catch (error: any) {
            console.error('Upload CV failed:', error);
            let errorMessage = "Upload failed. Please try again.";
            
            if (error.response) {
                // Lỗi từ server
                errorMessage = error.response.data?.message || "Server error occurred";
            } else if (error.request) {
                // Không nhận được response
                errorMessage = "No response from server. Please check your connection.";
            } else if (error.message) {
                // Lỗi khác
                errorMessage = error.message;
            }
            
            setUploadMessage(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // Bắt đầu chế độ chỉnh sửa
    const handleEditClick = () => {
        setEditData(studentData); // Sao chép dữ liệu hiện tại vào editData
        setIsEditing(true);
    };

    // Hủy chế độ chỉnh sửa
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditData(null); // Xóa dữ liệu chỉnh sửa
    };

    // Xử lý thay đổi trong các input khi đang chỉnh sửa
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editData) return;
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Lưu các thay đổi đã chỉnh sửa
    const handleSaveEdit = async () => {
        // Kiểm tra dữ liệu chỉnh sửa và studentID
        if (!editData || !editData.studentID) {
             console.warn("Edit data or student ID missing for save.");
             return;
        }
        // Tạo object chỉ chứa các trường cần cập nhật, loại bỏ 'status'
        const { status, ...updateFields } = editData;
        try {
            // Gọi service để cập nhật thông tin sinh viên
            await updateStudent(editData.studentID, updateFields);
            setIsEditing(false); // Tắt chế độ chỉnh sửa
            setEditData(null); // Xóa dữ liệu chỉnh sửa
            fetchProfileData(); // Lấy lại dữ liệu mới nhất sau khi lưu
        } catch (e) {
            console.error('Update failed:', e); // Log lỗi chi tiết
            alert('Cập nhật thất bại!'); // Thông báo lỗi cho người dùng
        }
    };

    // Effect hook để fetch dữ liệu khi component mount
    useEffect(() => {
        fetchProfileData();
    }, []); // Dependency rỗng chỉ chạy một lần khi mount

    // Hiển thị trạng thái loading ban đầu
    if (loading) {
        return <div className="text-center">Đang tải...</div>;
    }

    // Hiển thị thông báo nếu không tìm thấy dữ liệu sinh viên
    if (!studentData) {
        return <div className="text-center text-danger">Không tìm thấy thông tin sinh viên cho tài khoản này.</div>;
    }

    // Render giao diện profile
    return (
        <div id="profile" className="container rounded mt-5 mb-5">
            <div className="row">
                {/* Cột bên trái: Thông tin cơ bản và CV */}
                <div className="col-md-3 border-right">
                    <div className="d-flex flex-column align-items-center text-center p-3 py-5" style={{ gap: '10px' }}>
                        {/* Avatar hoặc placeholder */}
                        {/* <img className="rounded-circle mt-5" width="150px" src="https://st3.depositphotos.com/1537496/14611/v/600/depositphotos_146117859-stock-illustration-flat-business-man-user-profile.jpg" alt="Profile Avatar" /> */}
                        <span className="font-weight-bold mt-1">{studentData?.fullname}</span>
                        {/* Hiển thị trạng thái */}
                        <span className="text-black-50">Trạng thái: {studentData?.status}</span>
                        {/* Nút xem CV hiện tại nếu có */}
                        <span className="">
                            {/* LIÊN KẾT QUAN TRỌNG: href={studentData.cv} chỉ hoạt động nếu studentData.cv là URL xem công khai */}
                            {studentData?.cv && (
                                <a
                                    href={studentData.cv} // <-- Đảm bảo giá trị này là URL xem công khai từ backend
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary"
                                >
                                    Xem CV
                                </a>
                            )}
                        </span>
                    </div>
                </div>

                {/* Cột bên phải: Chi tiết profile và tải lên CV */}
                <div className="col-md-9 border-right">
                    <div className="p-3 py-2 profile-section" id="profileSection">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-right">Cài đặt Profile</h4>
                        </div>
                        {/* Các trường thông tin sinh viên */}
                        <div className="row mt-3">
                            <div className="col-md-6 mt-2">
                                <label className="labels">Mã sinh viên<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="studentCode" value={isEditing ? editData?.studentCode || '' : studentData?.studentCode || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Họ và tên<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="fullname" value={isEditing ? editData?.fullname || '' : studentData?.fullname || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Ngành học<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="major" value={isEditing ? editData?.major || '' : studentData?.major || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Email<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="email" value={isEditing ? editData?.email || '' : studentData?.email || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Địa chỉ<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="address" value={isEditing ? editData?.address || '' : studentData?.address || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Lớp<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" name="classroom" value={isEditing ? editData?.classroom || '' : studentData?.classroom || ''} onChange={isEditing ? handleEditChange : undefined} readOnly={!isEditing} />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Ngày sinh<span className="required-color">  <code>*</code></span></label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    name="dateOfBirth" 
                                    value={isEditing ? editData?.dateOfBirth || '' : studentData?.dateOfBirth || ''} 
                                    onChange={isEditing ? handleEditChange : undefined} 
                                    readOnly={!isEditing} 
                                />
                            </div>
                            <div className="col-md-6 mt-2">
                                <label className="labels">Trạng thái<span className="required-color">  <code>*</code></span></label>
                                <input type="text" className="form-control" value={studentData?.status || ''} readOnly />
                            </div>
                        </div>

                        {/* Khu vực tải lên CV */}
                        <div className="row mt-3 cv">
                            <div className="col-md-12 mt-2">
                                <div className="form-group">
                                    <label className="form-label">Tải lên CV</label>
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="file"
                                            name="cvFile"
                                            className="form-control"
                                            onChange={handleFileChange}
                                            disabled={isEditing || uploading}
                                            ref={fileInputRef}
                                            accept=".pdf,.doc,.docx"
                                        />
                                        {newCvFile && (
                                            <button
                                                className="btn btn-primary"
                                                onClick={handleUploadCv}
                                                disabled={uploading || isEditing}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Đang tải lên...
                                                    </>
                                                ) : (
                                                    'Tải lên'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    {uploadMessage && (
                                        <div className={`mt-2 alert ${uploadMessage.includes('thành công') ? 'alert-success' : 'alert-danger'}`}>
                                            {uploadMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <style>
                            {`
                                .upload-area {
                                    border: 2px dashed #dee2e6;
                                    border-radius: 8px;
                                    padding: 20px;
                                    background-color: #f8f9fa;
                                    transition: all 0.3s ease;
                                }
                                .upload-area:hover {
                                    border-color: #0d6efd;
                                    background-color: #f0f7ff;
                                }
                                .upload-container {
                                    position: relative;
                                    text-align: center;
                                }
                                .upload-input {
                                    position: absolute;
                                    width: 100%;
                                    height: 100%;
                                    top: 0;
                                    left: 0;
                                    opacity: 0;
                                    cursor: pointer;
                                }
                                .upload-info {
                                    padding: 20px;
                                }
                                .upload-info i {
                                    font-size: 48px;
                                    color: #0d6efd;
                                    margin-bottom: 10px;
                                }
                                .file-name {
                                    flex: 1;
                                    padding: 8px 12px;
                                    background-color: #f8f9fa;
                                    border-radius: 4px;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    white-space: nowrap;
                                }
                            `}
                        </style>

                        {/* Nút chỉnh sửa (chỉ hiển thị khi không ở chế độ chỉnh sửa) */}
                        {!isEditing && (
                            <div className="mt-3 d-flex justify-content-center">
                                <button className="btn btn-primary" onClick={handleEditClick}>Edit</button>
                            </div>
                        )}
                    </div>

                    {/* Các nút Lưu và Hủy (chỉ hiển thị khi ở chế độ chỉnh sửa) */}
                    {isEditing && (
                        <div className="mt-3 d-flex justify-content-center gap-2">
                            <button className="btn btn-success" onClick={handleSaveEdit}>Save</button>
                            <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
