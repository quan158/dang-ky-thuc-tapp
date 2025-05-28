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
@Table(name = "Proposal")
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
    String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentID", nullable = false)
    Student student;
}

