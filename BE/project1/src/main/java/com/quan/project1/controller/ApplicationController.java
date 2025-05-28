package com.quan.project1.controller;

// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse
import com.quan.project1.dto.response.ApplicationResponse;
import com.quan.project1.service.ApplicationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/application")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ApplicationController {

    ApplicationService applicationService;

    @PostMapping("/apply/{internshipID}")
    ApplicationResponse applyInternship(@PathVariable String internshipID) {
        return applicationService.applyInternship(internshipID);
    }

    @PutMapping("/approve/{applicationID}")
    ApplicationResponse approveApplication(@PathVariable String applicationID,
                                           @RequestParam String status) {
        return applicationService.approveApplication(applicationID, status);
    }

    @DeleteMapping("/{applicationID}")
    void deleteApplication(@PathVariable String applicationID) {
        applicationService.deleteApplicationByStudent(applicationID);
    }

    @GetMapping("/practice")
    List<ApplicationResponse> getApprovedApplications() {
        return applicationService.getApprovedApplications();
    }

    @GetMapping("/approved/list")
    List<ApplicationResponse> getStudentApplications() {
        return applicationService.getStudentApplication();
    }

    @GetMapping("/list")
    List<ApplicationResponse> getApplications() {
        return applicationService.getApplications();
    }

    @GetMapping("/list/{studentID}")
    List<ApplicationResponse> getApplicationByStudentID(@PathVariable String studentID){
        return applicationService.getApplicationByStudentID(studentID);
    }
}