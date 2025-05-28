package com.quan.project1.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentRequest {
    String studentCode;

    String fullname;
    String major;
    String email;
    String cv;
    String classroom;
    LocalDate dateOfBirth;
    String address;
    String status;
}
