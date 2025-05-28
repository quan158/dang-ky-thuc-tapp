package com.quan.project1.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String studentID;

    @Column(unique = true, nullable = false)
    String studentCode;

    String fullname;
    String email;
    String major;
    String cv;
    String address;
    String classroom;

    String status = "NOT_REGISTER";

    LocalDate dateOfBirth;

    @Column(nullable = false, updatable = false)
    Timestamp createAt;

    @PrePersist
    protected void onCreate() {
        this.createAt = new Timestamp(System.currentTimeMillis());
    }

    @OneToOne
    @JoinColumn(name = "account_id", referencedColumnName = "accountID", nullable = false)
    Account account;

    @OneToMany(mappedBy = "student", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Proposal> proposals;

    @OneToMany(mappedBy = "student", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<Application> applications;

}
