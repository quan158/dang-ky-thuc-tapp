package com.quan.project1.repository;

import com.quan.project1.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, String> {
    boolean existsByCompanyName(String companyName);

    @Query(value = "SELECT * FROM COMPANY WHERE company_name LIKE CONCAT('%', ?1, '%')", nativeQuery = true)
    List<Company> searchCompany(String companyName);

    Optional<Company> findByAccount_AccountID(String accountID);
}
