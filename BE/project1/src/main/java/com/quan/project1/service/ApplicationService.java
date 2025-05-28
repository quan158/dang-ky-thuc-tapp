package com.quan.project1.service;

import com.quan.project1.dto.response.ApplicationResponse;
import com.quan.project1.entity.*;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.ApplicationMapper;
import com.quan.project1.mapper.StudentMapper;
import com.quan.project1.repository.*;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationService {
    private final CompanyRepository companyRepository;
    ApplicationRepository applicationRepository;
    ApplicationMapper applicationMapper;
    AccountRepository accountRepository;
    StudentRepository studentRepository;
    InternshipRepository internshipRepository;
    StudentMapper studentMapper;

    @PreAuthorize("hasRole('STUDENT')")
    public ApplicationResponse applyInternship(String internshipID){
        Student student = getStudentByToken();
        //kiểm tra trạng thái của student
        if ("PENDING".equalsIgnoreCase(student.getStatus())
                || "APPROVED".equalsIgnoreCase(student.getStatus())
                || "COMPLETED".equalsIgnoreCase(student.getStatus())) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_INTERNAL);
        }

        Internship internship = internshipRepository.findById(internshipID)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNSHIP_NOT_FOUND));
        if(internship.getRecruitmentQuantity() <= 0){
            throw new RuntimeException("Tin tuyển dụng đã tuyển đủ số lượng");
        }
        Application application = new Application();

        application.setInternship(internship);
        application.setStudent(student);

        studentMapper.updateStatusStudent(student, application.getStatus());
        studentRepository.save(student);
        return applicationMapper.toApplicationResponse(applicationRepository.save(application));
    }

    @Transactional
    @PreAuthorize("hasRole('COMPANY')")
    public ApplicationResponse approveApplication(String applicationID, String status) {

        Application application = applicationRepository.findById(applicationID)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        Internship internship = application.getInternship();

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        if (!internship.getCompany().getAccount().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if ("APPROVED".equalsIgnoreCase(status)) {
            if (internship.getRecruitmentQuantity() <= 0) {
                throw new AppException(ErrorCode.RECRUITMENT_FULL);
            }
            // Giảm số lượng đi 1
            internship.setRecruitmentQuantity(internship.getRecruitmentQuantity() - 1);
            internshipRepository.save(internship);
        }

        application.updateStatus(status);

        Student student = application.getStudent();
        studentMapper.updateStatusStudent(student, status);
        studentRepository.save(student);

        return applicationMapper.toApplicationResponse(applicationRepository.save(application));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public void deleteApplicationByStudent(String applicationId) {
        Student student = getStudentByToken();

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

            if (!application.getStudent().getStudentID().equals(student.getStudentID())) {
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }

            String status = application.getStatus();
            if ("APPROVED".equalsIgnoreCase(status)) {
                throw new RuntimeException("Đơn đăng ký của bạn đã được duyệt, không thể xóa.");
            }
            student.setStatus("NOT_REGISTER");
            studentRepository.save(student);
            applicationRepository.delete(application);
    }




    @PreAuthorize("hasRole('COMPANY')")
    public List<ApplicationResponse> getApprovedApplications() {
        // Lấy username từ token
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm account công ty
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Company company = companyRepository.findByAccount_AccountID(account.getAccountID())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Tìm tất cả internship mà công ty này đã đăng
        List<Internship> internships = internshipRepository.findAllByCompany(company);
        if (internships.isEmpty()) {
            throw new AppException(ErrorCode.INTERNSHIP_NOT_FOUND);
        }

        // Lấy tất cả application đã duyệt (APPROVED) của các internship này
        List<Application> approvedApplications = applicationRepository.findAllByInternshipInAndStatus(
                internships, "APPROVED"
        );

        return approvedApplications.stream()
                .map(applicationMapper::toApplicationResponse)
                .toList();
    }

    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public List<ApplicationResponse> getStudentApplication() {
        List<String> status = new ArrayList<>();
        status.add("APPROVED");
        status.add("COMPLETED");
        List<Application> approvedApplications = applicationRepository.findAllByStatusIn(status
        );

        return approvedApplications.stream()
                .map(applicationMapper::toApplicationResponse)
                .toList();
    }


    @PreAuthorize("hasRole('COMPANY')")
    public List<ApplicationResponse> getApplications() {
        // Lấy username từ token
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        // Tìm account của công ty
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Company company = companyRepository.findByAccount_AccountID(account.getAccountID())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Tìm tất cả internship mà công ty này đã đăng
        List<Internship> internships = internshipRepository.findAllByCompany(company);
        if (internships.isEmpty()) {
            throw new AppException(ErrorCode.INTERNSHIP_NOT_FOUND);
        }

        // Lấy tất cả application liên quan đến các internship đó
        List<Application> applications = applicationRepository.findAllByInternshipIn(internships);

        return applications.stream()
                .map(applicationMapper::toApplicationResponse)
                .toList();
    }

    public Student getStudentByToken() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Student student = studentRepository.findByAccount(account);
        if (student == null) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return student;
    }

    @PreAuthorize("hasRole('STUDENT')")
    public List<ApplicationResponse> getApplicationByStudentID(String studentID) {
        // Tìm sinh viên theo studentID
        Student student = studentRepository.findById(studentID)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

        // Lấy tất cả application của sinh viên này
        List<Application> applications = applicationRepository.findAllByStudent(student);

        return applications.stream()
                .map(applicationMapper::toApplicationResponse)
                .toList();
    }


}
