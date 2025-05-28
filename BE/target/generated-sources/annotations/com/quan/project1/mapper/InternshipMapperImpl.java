package com.quan.project1.mapper;

import com.quan.project1.dto.request.InternshipRequest;
import com.quan.project1.dto.response.InternshipResponse;
import com.quan.project1.entity.Internship;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class InternshipMapperImpl implements InternshipMapper {

    @Autowired
    private CompanyMapper companyMapper;

    @Override
    public Internship toInternship(InternshipRequest request) {
        if ( request == null ) {
            return null;
        }

        Internship.InternshipBuilder internship = Internship.builder();

        internship.position( request.getPosition() );
        internship.description( request.getDescription() );
        internship.requirement( request.getRequirement() );
        internship.benefits( request.getBenefits() );
        internship.recruitmentQuantity( request.getRecruitmentQuantity() );

        return internship.build();
    }

    @Override
    public InternshipResponse toInternshipResponse(Internship internship) {
        if ( internship == null ) {
            return null;
        }

        InternshipResponse.InternshipResponseBuilder internshipResponse = InternshipResponse.builder();

        internshipResponse.companyResponse( companyMapper.toCompanyResponse( internship.getCompany() ) );
        internshipResponse.internshipID( internship.getInternshipID() );
        internshipResponse.position( internship.getPosition() );
        internshipResponse.description( internship.getDescription() );
        internshipResponse.requirement( internship.getRequirement() );
        internshipResponse.benefits( internship.getBenefits() );
        internshipResponse.status( internship.getStatus() );
        internshipResponse.recruitmentQuantity( internship.getRecruitmentQuantity() );

        return internshipResponse.build();
    }

    @Override
    public void updateInternship(Internship internship, InternshipRequest request) {
        if ( request == null ) {
            return;
        }

        internship.setPosition( request.getPosition() );
        internship.setDescription( request.getDescription() );
        internship.setRequirement( request.getRequirement() );
        internship.setBenefits( request.getBenefits() );
        internship.setRecruitmentQuantity( request.getRecruitmentQuantity() );
    }
}
