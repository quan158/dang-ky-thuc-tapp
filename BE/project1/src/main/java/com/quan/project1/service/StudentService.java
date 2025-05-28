package com.quan.project1.service;

import com.quan.project1.dto.request.StudentRequest;
import com.quan.project1.dto.response.StudentResponse;
import com.quan.project1.entity.Account;
import com.quan.project1.entity.Student;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.StudentMapper;
import com.quan.project1.repository.AccountRepository;
import com.quan.project1.repository.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StudentService {
    StudentRepository studentRepository;
    StudentMapper studentMapper;
    AccountRepository accountRepository;
    PasswordEncoder passwordEncoder;
    DropboxService dropboxService;

    @Transactional
    public String uploadStudentCV(String studentId, MultipartFile file) {
        log.info("Bắt đầu tải lên CV cho sinh viên có ID: {}", studentId);

        // Kiểm tra file
        if (file == null || file.isEmpty()) {
            log.error("File CV rỗng cho sinh viên ID: {}", studentId);
            throw new RuntimeException("File CV không được để trống");
        }

        // Định dạng file được chấp nhận
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            log.error("Định dạng file không được hỗ trợ: {}", contentType);
            throw new RuntimeException("Chỉ chấp nhận file PDF");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> {
                    log.error("Không tìm thấy sinh viên có ID: {}", studentId);
                    return new AppException(ErrorCode.STUDENT_NOT_FOUND);
                });

        try {
            // Xử lý tên file để tránh lỗi
            String filename = file.getOriginalFilename();
            if (filename == null || filename.isEmpty()) { // Thêm kiểm tra filename rỗng
                filename = "cv_" + studentId + ".pdf";
            } else {
                filename = dropboxService.normalizePath(filename); // Sử dụng hàm normalizePath từ DropboxService
                // Xóa dấu "/" ở đầu nếu có sau khi normalize
                if (filename.startsWith("/")) {
                    filename = filename.substring(1);
                }
            }

            // Thêm mã sinh viên vào tên file để đảm bảo tính duy nhất và dễ quản lý
            String studentCode = student.getStudentCode();
            // Kết hợp đường dẫn thư mục /cv với mã sinh viên và tên file đã chuẩn hóa
            String dropboxPath = "/cv/" + studentCode + "_" + filename;
            // Tải lên Dropbox và nhận về URL xem công khai
            String publicSharedUrl = dropboxService.uploadFile(file, dropboxPath);

            // Cập nhật thông tin sinh viên với URL xem công khai
            student.setCv(publicSharedUrl);
            studentRepository.save(student);

            return publicSharedUrl; // Trả về URL xem công khai cho frontend
        } catch (RuntimeException e) { // Bắt RuntimeException từ DropboxService
            log.error("Lỗi trong quá trình tải CV lên Dropbox hoặc tạo link cho sinh viên ID: {}"
                    , studentId, e);
            throw e; // Ném lại lỗi để controller xử lý
        } catch (Exception e) {
            log.error("Lỗi không xác định trong StudentService khi tải CV: {}"
                    , studentId, e);
            throw new RuntimeException( "Lỗi không xác định khi tải CV: "
                    + e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('STUDENT','StudentServicesDepartmentStaff')")
    public Student createStudent(StudentRequest request) {
        if (studentRepository.existsByStudentCode(request.getStudentCode())) {
            throw new AppException(ErrorCode.STUDENT_EXISTED);
        }

        Account account;
        String studentCode = request.getStudentCode();

        // Kiểm tra xem đã có Account với username = studentCode chưa
        Optional<Account> optionalAccount = accountRepository.findByUsername(studentCode);
        if (optionalAccount.isPresent()) {
            account = optionalAccount.get();
        } else {
            // Nếu chưa có, tạo Account mới
            account = new Account();
            account.setUsername(studentCode);
            String rawPassword;
            if (request.getDateOfBirth() != null) {
                // Gán ngày sinh dạng ddMMyyyy làm mật khẩu
                rawPassword = request.getDateOfBirth().format(DateTimeFormatter.ofPattern("ddMMyyyy"));
            } else {
                // Nếu không có ngày sinh, fallback dùng studentCode
                rawPassword = studentCode;
            }
            account.setPassword(passwordEncoder.encode(rawPassword));

            account.setFullname(request.getFullname());
            Set<String> roles = new HashSet<>();
            roles.add("STUDENT");  // gán role STUDENT
            account.setRoles(roles);
            account = accountRepository.save(account);
        }

        // Tạo mới Student và gắn account
        Student student = studentMapper.toStudent(request);
        student.setAccount(account);

        return studentRepository.save(student);
    }


    @PreAuthorize("hasAnyRole('STUDENT','StudentServicesDepartmentStaff')")
    public StudentResponse updateStudent(String studentID, StudentRequest request){
        Student student = studentRepository.findById(studentID)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        studentMapper.updateStudent(student, request);

        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();
        Account account = accountRepository.findByUsername(name)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        if (account.getRoles().contains("StudentServicesDepartmentStaff")) {
            student.setStatus(request.getStatus());
        }


        return studentMapper.toStudentResponse(studentRepository.save(student));
    }

    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public List<StudentResponse> getAllStudent() {
        return studentRepository.findAll().stream()
                .map(studentMapper::toStudentResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public void deleteStudent(String studentID)
    {
        Student student = studentRepository.findById(studentID)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        studentRepository.deleteById(studentID);
        accountRepository.deleteById(student.getAccount().getAccountID());
    }

    public StudentResponse getStudent(String studentID){
        return studentMapper.toStudentResponse(studentRepository.findById(studentID)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }

    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public StudentResponse findStudentByStudentCode(String StudentCode){
        return studentMapper.toStudentResponse(studentRepository.findByStudentCode(StudentCode)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }

    @PreAuthorize("hasAnyRole('STUDENT','StudentServicesDepartmentStaff')")
    public StudentResponse getStudentByAccountID(String accountID) {
        Student student = studentRepository.findByAccount_AccountID(accountID)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return studentMapper.toStudentResponse(student);
    }

}
