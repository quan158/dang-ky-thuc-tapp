package com.quan.project1.controller;

import com.quan.project1.dto.request.InternshipRequest;
// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse
import com.quan.project1.dto.response.InternshipResponse;
import com.quan.project1.service.InternshipService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/internship")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class InternshipController {
    InternshipService internshipService;

    @PostMapping
    InternshipResponse createInternship(@RequestBody InternshipRequest request){
        return internshipService.createInternship(request);
    }

    @PutMapping("/{internshipID}")
    InternshipResponse updateInternship(@PathVariable("internshipID") String internshipID,@RequestBody InternshipRequest request){
        return internshipService.updateInternship(internshipID, request);
    }

    @PutMapping("/approved/{internshipID}")
    InternshipResponse updateStatusInternship(@PathVariable("internshipID") String internshipID,@RequestParam String status){
        return internshipService.updateStatusInternship(internshipID, status);
    }

    @GetMapping("/{internshipID}")
    InternshipResponse getInternship(@PathVariable("internshipID") String internshipID){ // Sửa lỗi chính tả biến PathVariable
        return internshipService.getInternship(internshipID);
    }

    @GetMapping
    List<InternshipResponse> getAllInternship(){
        return internshipService.getAllInternship();
    }

    @GetMapping("/list")
    List<InternshipResponse> getAllInternshipByMyCompany(){
        return internshipService.getInternshipByMyCompany();
    }

    @GetMapping("/list/{companyID}")
    List<InternshipResponse> getAllInternshipByCompany(@PathVariable String companyID){
        return internshipService.getInternshipCompanyID(companyID);
    }

    @GetMapping("/list/{companyID}/approved")
    public List<InternshipResponse> getAllInternshipByCompanyAndStatus(@PathVariable String companyID) {
        return internshipService.getInternshipCompanyIDAndStatus(companyID);
    }


    @DeleteMapping("/{internshipID}")
    void deleteInternship(@PathVariable("internshipID") String internshipID) {
        internshipService.deleteInternship(internshipID);
    }}