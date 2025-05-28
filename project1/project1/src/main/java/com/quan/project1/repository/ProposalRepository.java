package com.quan.project1.repository;

import com.quan.project1.entity.Proposal;
import com.quan.project1.entity.Student;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, String> {
    @Modifying
    @Transactional
    @Query("UPDATE Proposal p SET p.status = :status WHERE p.proposalID = :proposalID")
    int updateProposalStatus(String proposalID, String status);

    List<Proposal> findByStudent(Student student);

}
