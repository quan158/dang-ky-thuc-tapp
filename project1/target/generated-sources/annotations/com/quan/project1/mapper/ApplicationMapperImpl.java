package com.quan.project1.mapper;

import com.quan.project1.dto.response.ApplicationResponse;
import com.quan.project1.entity.Application;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class ApplicationMapperImpl implements ApplicationMapper {

    @Autowired
    private StudentMapper studentMapper;
    @Autowired
    private InternshipMapper internshipMapper;

    @Override
    public ApplicationResponse toApplicationResponse(Application application) {
        if ( application == null ) {
            return null;
        }

        ApplicationResponse.ApplicationResponseBuilder applicationResponse = ApplicationResponse.builder();

        applicationResponse.student( studentMapper.toStudentResponse( application.getStudent() ) );
        applicationResponse.internship( internshipMapper.toInternshipResponse( application.getInternship() ) );
        applicationResponse.applicationID( application.getApplicationID() );
        applicationResponse.status( application.getStatus() );
        applicationResponse.appliedAt( application.getAppliedAt() );
        applicationResponse.approvedAt( application.getApprovedAt() );

        return applicationResponse.build();
    }
}
