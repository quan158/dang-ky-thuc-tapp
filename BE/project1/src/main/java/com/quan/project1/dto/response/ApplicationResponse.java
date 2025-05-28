package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApplicationResponse {
    String applicationID;

    StudentResponse student;

    InternshipResponse internship;

    String status;

    Timestamp appliedAt;
    Timestamp approvedAt;

}
