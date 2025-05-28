package com.quan.project1.repository;

import com.quan.project1.entity.Account;
import com.quan.project1.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, String> {
    boolean existsByStudentCode(String studentCode);

    Student findByAccount(Account account);
    List<Student> findByStatus(String status);
    Optional<Student> findByStudentCode(String studentCode);

    Optional<Student> findByAccount_AccountID(String accountID);
}
