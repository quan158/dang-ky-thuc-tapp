package com.quan.project1.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Company")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String companyID;

    String companyName;
    String phone;
    String address;
    String email;
    String companyWebsite;
    String avatar;

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "accountID", nullable = false, unique = true)
    Account account;
}

