package com.quan.project1.service;

import com.quan.project1.dto.request.InternshipRequest;
import com.quan.project1.dto.response.InternshipResponse;
import com.quan.project1.entity.Account;
import com.quan.project1.entity.Company;
import com.quan.project1.entity.Internship;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.InternshipMapper;
import com.quan.project1.repository.AccountRepository;
import com.quan.project1.repository.CompanyRepository;
import com.quan.project1.repository.InternshipRepository;
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
public class InternshipService {
    InternshipRepository internshipRepository;
    InternshipMapper internshipMapper;
    AccountRepository accountRepository;
    CompanyRepository companyRepository;

    @PreAuthorize("hasRole('COMPANY')")
    public InternshipResponse createInternship(InternshipRequest request){
        Internship internship = internshipMapper.toInternship(request);

        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Account account = accountRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Company company = companyRepository.findByAccount_AccountID(account.getAccountID())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        internship.setCompany(company);
        internship.setStatus("PENDING");
        return internshipMapper.toInternshipResponse(internshipRepository.save(internship));
    }

    @PreAuthorize("hasRole('COMPANY')")
    public InternshipResponse updateInternship(String internshipID, InternshipRequest request) {
        Internship internship = internshipRepository.findById(internshipID)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNSHIP_NOT_FOUND));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!internship.getCompany().getAccount().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if(internship.getStatus().equals("APPROVED")){
            throw new RuntimeException("Tin đăng tuyển đã được duyệt, không thể cập nhật");
        }

        internshipMapper.updateInternship(internship, request);
        return internshipMapper.toInternshipResponse(internshipRepository.save(internship));
    }

    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public InternshipResponse updateStatusInternship(String internshipID, String status) {
        Internship internship = internshipRepository.findById(internshipID)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNSHIP_NOT_FOUND));

        internship.setStatus(status);

        return internshipMapper.toInternshipResponse(internshipRepository.save(internship));
    }

    @PreAuthorize("hasAnyRole('COMPANY','StudentServicesDepartmentStaff')")
    public void deleteInternship(String internshipID) {
        Internship internship = internshipRepository.findById(internshipID)
                .orElseThrow(() -> new AppException(ErrorCode.INTERNSHIP_NOT_FOUND));

        internshipRepository.deleteById(internshipID);
    }

    public List<InternshipResponse> getInternshipByMyCompany() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Account account = accountRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Company company = companyRepository.findByAccount_AccountID(account.getAccountID())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        return internshipRepository.findAllByCompany(company).stream()
                .map(internshipMapper::toInternshipResponse)
                .toList();
    }

    public List<InternshipResponse> getInternshipCompanyID(String companyID) {
        return internshipRepository.findAllByCompanyCompanyID(companyID).stream()
                .map(internshipMapper::toInternshipResponse)
                .toList();
    }

    public List<InternshipResponse> getInternshipCompanyIDAndStatus(String companyID) {

        return internshipRepository.findAllByStatusAndCompanyID("APPROVED",companyID).stream()
                .map(internshipMapper::toInternshipResponse)
                .toList();
    }

    public InternshipResponse getInternship(String internshipID){
        Internship internship = internshipRepository.findById(internshipID)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_EXISTED));

        return internshipMapper.toInternshipResponse(internship);
    }

    @PreAuthorize("hasAnyRole('STUDENT','StudentServicesDepartmentStaff')")
    public List<InternshipResponse> getAllInternship(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Account account = accountRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<Internship> internships = new ArrayList<>();

        if(account.getRoles().contains("StudentServicesDepartmentStaff")){
            internships = internshipRepository.findAll();
        }

        if(account.getRoles().contains("STUDENT")){
            internships = internshipRepository.findAllByStatus("APPROVED");
        }

        return internships.stream()
                .map(internshipMapper::toInternshipResponse)
                .toList();
    }

}
