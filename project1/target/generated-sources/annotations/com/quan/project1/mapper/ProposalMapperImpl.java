package com.quan.project1.mapper;

import com.quan.project1.dto.request.ProposalRequest;
import com.quan.project1.dto.response.ProposalResponse;
import com.quan.project1.entity.Proposal;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class ProposalMapperImpl implements ProposalMapper {

    @Autowired
    private StudentMapper studentMapper;

    @Override
    public Proposal toProposal(ProposalRequest request) {
        if ( request == null ) {
            return null;
        }

        Proposal.ProposalBuilder proposal = Proposal.builder();

        proposal.companyName( request.getCompanyName() );
        proposal.companyLogo( request.getCompanyLogo() );
        proposal.employeeSize( request.getEmployeeSize() );
        proposal.address( request.getAddress() );
        proposal.location( request.getLocation() );
        proposal.taxNumber( request.getTaxNumber() );
        proposal.websiteUrl( request.getWebsiteUrl() );
        proposal.hrName( request.getHrName() );
        proposal.hrMail( request.getHrMail() );
        proposal.taskDescription( request.getTaskDescription() );
        proposal.jobPosition( request.getJobPosition() );

        return proposal.build();
    }

    @Override
    public ProposalResponse toProposalResponse(Proposal proposal) {
        if ( proposal == null ) {
            return null;
        }

        ProposalResponse.ProposalResponseBuilder proposalResponse = ProposalResponse.builder();

        proposalResponse.studentResponse( studentMapper.toStudentResponse( proposal.getStudent() ) );
        proposalResponse.proposalID( proposal.getProposalID() );
        proposalResponse.companyName( proposal.getCompanyName() );
        proposalResponse.companyLogo( proposal.getCompanyLogo() );
        proposalResponse.employeeSize( proposal.getEmployeeSize() );
        proposalResponse.address( proposal.getAddress() );
        proposalResponse.location( proposal.getLocation() );
        proposalResponse.taxNumber( proposal.getTaxNumber() );
        proposalResponse.websiteUrl( proposal.getWebsiteUrl() );
        proposalResponse.hrName( proposal.getHrName() );
        proposalResponse.hrMail( proposal.getHrMail() );
        proposalResponse.taskDescription( proposal.getTaskDescription() );
        proposalResponse.jobPosition( proposal.getJobPosition() );
        proposalResponse.status( proposal.getStatus() );

        return proposalResponse.build();
    }

    @Override
    public void updateProposal(Proposal proposal, ProposalRequest request) {
        if ( request == null ) {
            return;
        }

        proposal.setCompanyName( request.getCompanyName() );
        proposal.setCompanyLogo( request.getCompanyLogo() );
        proposal.setEmployeeSize( request.getEmployeeSize() );
        proposal.setAddress( request.getAddress() );
        proposal.setLocation( request.getLocation() );
        proposal.setTaxNumber( request.getTaxNumber() );
        proposal.setWebsiteUrl( request.getWebsiteUrl() );
        proposal.setHrName( request.getHrName() );
        proposal.setHrMail( request.getHrMail() );
        proposal.setTaskDescription( request.getTaskDescription() );
        proposal.setJobPosition( request.getJobPosition() );
    }
}
