package com.quan.project1.controller;

import com.quan.project1.dto.request.StudentRequest;
// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse
import com.quan.project1.dto.response.StudentResponse;
import com.quan.project1.entity.Student;
import com.quan.project1.service.DropboxService;
import com.quan.project1.service.StudentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/student")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class StudentController {
    StudentService studentService;
    DropboxService dropboxService; // Có thể bỏ nếu không dùng trực tiếp trong controller

    @PostMapping
    Student createStudent(@RequestBody @Valid StudentRequest request){
        return studentService.createStudent(request);
    }

    @GetMapping
    List<StudentResponse> getAllStudent(){
        return studentService.getAllStudent();
    }

    @PutMapping("/{studentID}")
    StudentResponse updateStudent(@PathVariable("studentID") String studentID, @RequestBody StudentRequest request){
        return studentService.updateStudent(studentID, request);
    }

    @GetMapping("/{studentID}")
    StudentResponse getStudent(@PathVariable("studentID") String studentID){
        return studentService.getStudent(studentID);
    }

    @GetMapping("/account/{accountID}")
    StudentResponse getStudentByAccountID(@PathVariable("accountID") String accountID){
        return studentService.getStudentByAccountID(accountID);
    }

    @PostMapping("/{studentId}/upload-cv")
    public String uploadCv(@PathVariable String studentId,
                           @RequestParam("file") MultipartFile file) {
        // StudentService.uploadStudentCV giờ đây trả về URL xem công khai
        return studentService.uploadStudentCV(studentId,file);
    }

    @DeleteMapping("/{studentID}")
    void deleteStudent(@PathVariable String studentID){
        studentService.deleteStudent(studentID);
    }
}
