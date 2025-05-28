package com.quan.project1.repository;

import com.quan.project1.entity.Company;
import com.quan.project1.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, String> {
    List<Internship> findAllByCompany(Company company);

    List<Internship> findAllByCompanyCompanyID(String companyID);

    List<Internship> findAllByStatus(String status);

    @Query("SELECT i FROM Internship i WHERE i.status = :status AND i.company.companyID = :companyID")
    List<Internship> findAllByStatusAndCompanyID(@Param("status") String status, @Param("companyID") String companyID);

}
