package com.quan.project1.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AccountResponse
{
     String accountID;
     String username;
     String email;
     String fullname;
     Timestamp createAt;
     String status;
     Set<String> roles;
}
