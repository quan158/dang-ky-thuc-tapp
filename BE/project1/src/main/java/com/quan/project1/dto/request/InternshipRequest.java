package com.quan.project1.dto.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Min;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InternshipRequest {
    String position;

    String description;

    String requirement;

    String benefits;

    @Min(value = 1, message = "Số lượng tuyển dụng phải lớn hơn hoặc bằng 1")
    int recruitmentQuantity;
}
