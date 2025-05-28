package com.quan.project1.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.util.Set;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String accountID;
    String username;
    String password;
    String email;
    String fullname;

    @Column(nullable = false, updatable = false)
    Timestamp createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Timestamp(System.currentTimeMillis());
    }


    String status;
    @ElementCollection(fetch = FetchType.EAGER)
    @Singular
    Set<String> roles;
}
