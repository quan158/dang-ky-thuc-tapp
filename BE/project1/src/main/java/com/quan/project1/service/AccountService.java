package com.quan.project1.service;

import com.quan.project1.dto.request.AccountRequest;
import com.quan.project1.dto.response.AccountResponse;
import com.quan.project1.entity.Account;
import com.quan.project1.entity.Company;
import com.quan.project1.entity.Student;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.AccountMapper;
import com.quan.project1.repository.AccountRepository;
import com.quan.project1.repository.CompanyRepository;
import com.quan.project1.repository.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AccountService {
    AccountRepository accountRepository;
    AccountMapper accountMapper;
    StudentRepository studentRepository;
    CompanyRepository companyRepository;
    PasswordEncoder passwordEncoder;

    public Account createAccount(AccountRequest request) {
        // Kiểm tra account đã tồn tại
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        Account account = accountMapper.toAccount(request);
        account.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<String> roles = new HashSet<>(request.getRoles());
        account.setRoles(roles);

        Account savedAccount = accountRepository.save(account);
        // Nếu role là STUDENT, tạo mới Student
        if (roles.contains("STUDENT")) {
            Student student = new Student();
            student.setStudentCode(savedAccount.getUsername());
            student.setFullname(account.getFullname());
            student.setEmail(account.getEmail());
            student.setAccount(savedAccount);
            studentRepository.save(student);
        }
        // Nếu role là COMPANY, tạo mới Company
        if (roles.contains("COMPANY")) {
            Company company = new Company();
            company.setAccount(savedAccount);
            company.setEmail(account.getEmail());
            companyRepository.save(company);
        }
        return savedAccount;
    }


    @PreAuthorize("hasRole('ADMIN')")
    public List<Account> getAllAccount(){
        return accountRepository.findAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse getAccount(String id)
    {
        return accountMapper.toAccountResponse(accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found")));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public AccountResponse updateAccount(String AccountID, AccountRequest request)
    {
        Account account = accountRepository.findById(AccountID)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        accountMapper.updateAccount(account,request);

        account.setPassword(passwordEncoder.encode(request.getPassword()));

        HashSet<String> roles = new HashSet<>(request.getRoles());

        account.setRoles(roles);

        return accountMapper.toAccountResponse(accountRepository.save(account));
    }

    public AccountResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        Account account = accountRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return accountMapper.toAccountResponse(account);
    }


    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAccount(String accountID)
    {
        accountRepository.deleteById(accountID);
    }
}
