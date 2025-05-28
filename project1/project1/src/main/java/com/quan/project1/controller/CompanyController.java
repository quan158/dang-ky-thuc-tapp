package com.quan.project1.controller;

import com.quan.project1.dto.request.CompanyRequest;
import com.quan.project1.dto.response.CompanyResponse;
import com.quan.project1.service.CompanyService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/company")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class CompanyController {
    CompanyService companyService;

    @PostMapping
    CompanyResponse createCompany(@RequestBody @Valid CompanyRequest request){
        return companyService.createCompany(request);
    }

    @PutMapping("/{companyID}")
    CompanyResponse updateCompany(@PathVariable("companyID") String companyID, @RequestBody CompanyRequest request)
    {
        return companyService.updateCompany(companyID, request);
    }

    @GetMapping("/profile")
    CompanyResponse getMyCompany(){
        return companyService.getMyCompany();
    }

    @GetMapping("/list")
    List<CompanyResponse> getAllCompany(){
        return companyService.getAllCompany();
    }

    @GetMapping("/{companyID}")
    CompanyResponse getCompany(@PathVariable("companyID") String companyID){
        return companyService.getCompany(companyID);
    }

    @GetMapping("/search")
    List<CompanyResponse> searchCompany(@RequestParam String companyName) {
        return companyService.searchCompany(companyName);
    }

    @PostMapping("/{companyID}/avatar")
    public ResponseEntity<String> uploadAvatar(@PathVariable String companyID,
                                               @RequestParam("file") MultipartFile file) {
        String avatarUrl = companyService.uploadAvatar(companyID, file);
        return ResponseEntity.ok(avatarUrl);
    }

}