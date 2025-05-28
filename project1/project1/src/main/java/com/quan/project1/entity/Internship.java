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
@Table(name = "Internship")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String internshipID;

    @Column(nullable = false)
    String position;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(columnDefinition = "TEXT")
    String requirement;

    @Column(columnDefinition = "TEXT")
    String benefits;

    @Column(nullable = false)
    int recruitmentQuantity;

    String status = "PENDING";
    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "companyID", nullable = false)
    Company company;
}
