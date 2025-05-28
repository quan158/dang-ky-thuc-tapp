package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentResponse {
    String studentID;
    String studentCode;

    String fullname;
    String major;
    String cv;
    String email;
    LocalDate dateOfBirth;
    String address;
    String classroom;
    String status;
    Timestamp createAt;
    AccountResponse accountResponse;
}
