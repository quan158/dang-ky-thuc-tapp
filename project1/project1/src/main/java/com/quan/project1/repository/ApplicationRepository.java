package com.quan.project1.repository;

import com.quan.project1.entity.Application;
import com.quan.project1.entity.Company;
import com.quan.project1.entity.Internship;
import com.quan.project1.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application,String> {
    boolean existsByStudent(Student student);


    List<Application> findAllByInternshipInAndStatus(List<Internship> internships, String status);

    List<Application> findAllByInternshipIn(List<Internship> internships);


    List<Application> findAllByStudent(Student student);

    List<Application> findAllByStatusIn(List<String> status);
}
