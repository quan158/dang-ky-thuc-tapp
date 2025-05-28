package com.quan.project1.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.sql.Timestamp;

@Entity
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "Application")
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String applicationID;

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "studentID", nullable = false)
    Student student;

    @ManyToOne
    @JoinColumn(name = "internship_id", referencedColumnName = "internshipID", nullable = false)
    Internship internship;

    @Column(nullable = false)
    String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(nullable = false, updatable = false)
    Timestamp appliedAt;

    Timestamp approvedAt;

    // Được gọi trước khi bản ghi mới được tạo
    @PrePersist
    protected void onCreate() {
        this.appliedAt = new Timestamp(System.currentTimeMillis());
        this.approvedAt = new Timestamp(System.currentTimeMillis());
    }

    public void updateStatus(String newStatus) {
        this.status = newStatus;
        if ("APPROVED".equalsIgnoreCase(newStatus) || "REJECTED".equalsIgnoreCase(newStatus)) {
            this.approvedAt = new Timestamp(System.currentTimeMillis());
        } else {
            this.approvedAt = null;
        }
    }

}
