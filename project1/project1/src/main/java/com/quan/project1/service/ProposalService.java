package com.quan.project1.service;

import com.quan.project1.dto.request.ProposalRequest;
import com.quan.project1.dto.response.ProposalResponse;
import com.quan.project1.entity.Account;
import com.quan.project1.entity.Proposal;
import com.quan.project1.entity.Student;
import com.quan.project1.exception.AppException;
import com.quan.project1.exception.ErrorCode;
import com.quan.project1.mapper.ProposalMapper;
import com.quan.project1.mapper.StudentMapper;
import com.quan.project1.repository.AccountRepository;
import com.quan.project1.repository.ProposalRepository;
import com.quan.project1.repository.StudentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProposalService {
    ProposalMapper proposalMapper;
    ProposalRepository proposalRepository;
    AccountRepository accountRepository;
    StudentRepository studentRepository;
    StudentMapper studentMapper;

    @PreAuthorize("hasRole('STUDENT')")
    @Transactional(rollbackFor = Exception.class)
    public ProposalResponse createProposal(ProposalRequest request) {
        Proposal proposal = proposalMapper.toProposal(request);

        Student student = getStudentByToken();

        if ("PENDING".equalsIgnoreCase(student.getStatus())
        || "APPROVED".equalsIgnoreCase(student.getStatus())) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_INTERNAL);
        }

        List<Proposal> existingProposals = proposalRepository.findByStudent(student);
        boolean hasActiveProposal = existingProposals.stream()
                .anyMatch(p -> p.getStatus().equals("PENDING") || p.getStatus().equals("APPROVED"));

        if (hasActiveProposal) {
            throw new AppException(ErrorCode.ALREADY_HAS_ACTIVE_PROPOSAL);
        }

        proposal.setStudent(student);
        proposal.setStatus("PENDING");
        Proposal savedProposal = proposalRepository.save(proposal);

        studentMapper.updateStatusStudent(student, proposal.getStatus());

        return proposalMapper.toProposalResponse(savedProposal);
    }

    @PreAuthorize("hasRole('STUDENT')")
    public ProposalResponse updateProposal(String proposalID, ProposalRequest request) {

        Student student = getStudentByToken();

        Proposal proposal = proposalRepository.findById(proposalID)
                .orElseThrow(() -> new AppException(ErrorCode.PROPOSAL_NOT_FOUND));

        // Kiểm tra quyền sở hữu
        if (!proposal.getStudent().getStudentID().equals(student.getStudentID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Chỉ cho phép cập nhật khi status là "PENDING"
        if (!"PENDING".equalsIgnoreCase(proposal.getStatus())) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }

        proposalMapper.updateProposal(proposal, request);

        Proposal updated = proposalRepository.save(proposal);

        return proposalMapper.toProposalResponse(updated);
    }


    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public ProposalResponse getProposal(String proposalID){
        Proposal proposal = proposalRepository.findById(proposalID)
                .orElseThrow(() -> new AppException((ErrorCode.PROPOSAL_NOT_FOUND)));
        return proposalMapper.toProposalResponse(proposal);
    }

    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public List<ProposalResponse> getAllProposal(){
        return proposalRepository.findAll().stream()
                .map(proposalMapper :: toProposalResponse)
                .toList();
    }

    @Transactional
    @PreAuthorize("hasRole('StudentServicesDepartmentStaff')")
    public ProposalResponse updateStatus(String proposalID, String status) {
        int updatedRows = proposalRepository.updateProposalStatus(proposalID, status);

        if (updatedRows == 0) {
            throw new AppException(ErrorCode.PROPOSAL_NOT_FOUND);
        }

        Proposal proposal = proposalRepository.findById(proposalID)
                .orElseThrow(() -> new AppException(ErrorCode.PROPOSAL_NOT_FOUND));

        Student student = proposal.getStudent();

        // Cập nhật trạng thái student theo trạng thái proposal mới
        studentMapper.updateStatusStudent(student, status);

        return proposalMapper.toProposalResponse(proposal);
    }

    @PreAuthorize("hasRole('STUDENT')")
    public List<ProposalResponse> getMyProposals() {
        Student student = getStudentByToken();
        return proposalRepository.findByStudent(student).stream()
                .map(proposalMapper::toProposalResponse)
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

}
