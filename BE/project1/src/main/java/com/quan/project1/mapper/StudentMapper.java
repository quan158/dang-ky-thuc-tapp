package com.quan.project1.mapper;

import com.quan.project1.dto.request.StudentRequest;
import com.quan.project1.dto.response.StudentResponse;
import com.quan.project1.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = AccountMapper.class)
public interface StudentMapper {
    Student toStudent(StudentRequest request);

    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateStudent(@MappingTarget Student student, StudentRequest request);

    @Mapping(target = "accountResponse", source = "account")
    StudentResponse toStudentResponse(Student student);

    default void updateStatusStudent(@MappingTarget Student student, String status) {
        student.setStatus(status);
    }
}
