package com.quan.project1.dto.response;

import com.quan.project1.entity.Company;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InternshipResponse {
    String internshipID;

    String position;

    String description;

    String requirement;

    String benefits;

    String status;

    int recruitmentQuantity;

    CompanyResponse companyResponse;
}
