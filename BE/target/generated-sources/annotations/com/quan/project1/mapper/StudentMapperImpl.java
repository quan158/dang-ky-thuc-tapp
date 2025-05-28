package com.quan.project1.mapper;

import com.quan.project1.dto.request.StudentRequest;
import com.quan.project1.dto.response.StudentResponse;
import com.quan.project1.entity.Student;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class StudentMapperImpl implements StudentMapper {

    @Autowired
    private AccountMapper accountMapper;

    @Override
    public Student toStudent(StudentRequest request) {
        if ( request == null ) {
            return null;
        }

        Student.StudentBuilder student = Student.builder();

        student.studentCode( request.getStudentCode() );
        student.fullname( request.getFullname() );
        student.email( request.getEmail() );
        student.major( request.getMajor() );
        student.cv( request.getCv() );
        student.address( request.getAddress() );
        student.classroom( request.getClassroom() );
        student.status( request.getStatus() );
        student.dateOfBirth( request.getDateOfBirth() );

        return student.build();
    }

    @Override
    public void updateStudent(Student student, StudentRequest request) {
        if ( request == null ) {
            return;
        }

        student.setStudentCode( request.getStudentCode() );
        student.setFullname( request.getFullname() );
        student.setEmail( request.getEmail() );
        student.setMajor( request.getMajor() );
        student.setCv( request.getCv() );
        student.setAddress( request.getAddress() );
        student.setClassroom( request.getClassroom() );
        student.setDateOfBirth( request.getDateOfBirth() );
    }

    @Override
    public StudentResponse toStudentResponse(Student student) {
        if ( student == null ) {
            return null;
        }

        StudentResponse.StudentResponseBuilder studentResponse = StudentResponse.builder();

        studentResponse.accountResponse( accountMapper.toAccountResponse( student.getAccount() ) );
        studentResponse.studentID( student.getStudentID() );
        studentResponse.studentCode( student.getStudentCode() );
        studentResponse.fullname( student.getFullname() );
        studentResponse.major( student.getMajor() );
        studentResponse.cv( student.getCv() );
        studentResponse.email( student.getEmail() );
        studentResponse.dateOfBirth( student.getDateOfBirth() );
        studentResponse.address( student.getAddress() );
        studentResponse.classroom( student.getClassroom() );
        studentResponse.status( student.getStatus() );
        studentResponse.createAt( student.getCreateAt() );

        return studentResponse.build();
    }
}
