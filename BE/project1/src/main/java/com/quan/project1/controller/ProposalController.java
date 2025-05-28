package com.quan.project1.controller;

import com.quan.project1.dto.request.ProposalRequest;
// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse
import com.quan.project1.dto.response.ProposalResponse;
import com.quan.project1.mapper.ProposalMapper;
import com.quan.project1.repository.ProposalRepository;
import com.quan.project1.service.ProposalService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/proposal")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ProposalController {
    ProposalService proposalService;
    ProposalRepository proposalRepository;
    ProposalMapper proposalMapper;

    @PostMapping
    ProposalResponse createProposal(@RequestBody @Valid ProposalRequest request){
        return proposalService.createProposal(request);
    }

    @PutMapping("/{proposalID}")
    ProposalResponse updateProposalContent (@PathVariable("proposalID") String proposalID, @RequestBody ProposalRequest request){
        return proposalService.updateProposal(proposalID,request);
    }

    @GetMapping("/{proposalID}")
    ProposalResponse getProposal(@PathVariable("proposalID") String proposalID){
        return proposalService.getProposal(proposalID);
    }

    @GetMapping("/list")
    List<ProposalResponse> getAllProposal(){
        return proposalService.getAllProposal();
    }

    @GetMapping("/myProposal")
    List<ProposalResponse> getMyProposals() {
        return proposalService.getMyProposals();
    }

    @PutMapping("/{proposalID}/status")
    public ProposalResponse updateProposalStatus(@PathVariable("proposalID") String proposalID,
                                                 @RequestParam String status) {
        return proposalService.updateStatus(proposalID, status);
    }

}