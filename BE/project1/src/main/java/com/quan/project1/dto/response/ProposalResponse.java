package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProposalResponse {
    String proposalID;
    String companyName;
    String companyLogo;
    String employeeSize;
    String address;
    String location;
    String taxNumber;
    String websiteUrl;
    String hrName;
    String hrMail;
    String taskDescription;
    String jobPosition;
    String evidence;
    String status;
    StudentResponse studentResponse;
}
