package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set; // Import Set

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LoginResponse
{
    String token;
    boolean authenticated;
    Set<String> roles; // <<< Đã thêm trường roles
}