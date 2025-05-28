package com.quan.project1.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompanyRequest {
    String companyName;
    String phone;
    String email;
    String address;
    String companyWebsite;
    String avatar;
}
