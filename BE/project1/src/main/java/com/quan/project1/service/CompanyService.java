package com.quan.project1.service;

import com.quan.project1.dto.request.CompanyRequest;
import com.quan.project1.dto.response.CompanyResponse;
import com.quan.project1.entity.Account;
import com.quan.project1.entity.Company;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.CompanyMapper;
import com.quan.project1.repository.AccountRepository;
import com.quan.project1.repository.CompanyRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CompanyService {

    CompanyRepository companyRepository;
    CompanyMapper companyMapper;
    AccountRepository accountRepository;
    String UPLOAD_DIR = "uploads/avatars/";

    @PreAuthorize("hasRole('COMPANY')")
    public CompanyResponse createCompany(CompanyRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (companyRepository.existsByCompanyName(request.getCompanyName())) {
            throw new AppException(ErrorCode.COMPANY_EXISTED);
        }

        Company company = companyMapper.toCompany(request);
        company.setAccount(account);

        return companyMapper.toCompanyResponse(companyRepository.save(company));
    }

    @PreAuthorize("hasRole('COMPANY')")
    public CompanyResponse getMyCompany() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Company company = companyRepository.findByAccount_AccountID(account.getAccountID())
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));

        return companyMapper.toCompanyResponse(company);
    }

    @PreAuthorize("hasRole('COMPANY')")
    public CompanyResponse updateCompany(String companyID, CompanyRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Company company = companyRepository.findById(companyID)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));

        if (!company.getAccount().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        companyMapper.updateCompany(company, request);
        return companyMapper.toCompanyResponse(companyRepository.save(company));
    }

    public List<CompanyResponse> getAllCompany() {
        return companyRepository.findAll().stream()
                .map(companyMapper::toCompanyResponse)
                .toList();
    }

    public CompanyResponse getCompany(String companyID) {
        Company company = companyRepository.findById(companyID)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));
        return companyMapper.toCompanyResponse(company);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCompany(String companyID) {
        companyRepository.deleteById(companyID);
    }

    public List<CompanyResponse> searchCompany(String companyName) {
        return companyRepository.searchCompany(companyName).stream()
                .map(companyMapper::toCompanyResponse)
                .toList();
    }

    @PreAuthorize("hasRole('COMPANY')")
    public String uploadAvatar(String companyID, MultipartFile file) {
        Company company = companyRepository.findById(companyID)
                .orElseThrow(() -> new AppException(ErrorCode.COMPANY_NOT_FOUND));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!company.getAccount().getUsername().equals(username)) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        try {
            // Kiểm tra file hợp lệ
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("File không hợp lệ");
            }

            if (file.getSize() > 2 * 1024 * 1024) { // Giới hạn 2MB
                throw new RuntimeException("File vượt quá 2MB");
            }

            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file ngẫu nhiên
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFileName);

            // Lưu file
            Files.copy(file.getInputStream(), filePath);

            String avatarUrl = "/resources/avatars/" + uniqueFileName;
            company.setAvatar(avatarUrl);
            companyRepository.save(company);

            return avatarUrl;

        } catch (IOException e) {
            log.error("Lỗi upload ảnh: {}", e.getMessage());
            throw new RuntimeException("Upload ảnh thất bại", e);
        }
    }
}
