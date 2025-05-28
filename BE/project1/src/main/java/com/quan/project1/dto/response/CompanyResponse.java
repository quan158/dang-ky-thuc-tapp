package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompanyResponse {
    String companyID;
    String companyName;
    String phone;
    String address;
    String email;
    String companyWebsite;
    String avatar;
    AccountResponse accountResponse;
}
