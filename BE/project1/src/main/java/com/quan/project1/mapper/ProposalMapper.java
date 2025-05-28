package com.quan.project1.mapper;

import com.quan.project1.dto.request.ProposalRequest;
import com.quan.project1.dto.response.ProposalResponse;
import com.quan.project1.entity.Proposal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = StudentMapper.class)
public interface ProposalMapper {

    Proposal toProposal(ProposalRequest request);

    @Mapping(target = "studentResponse", source = "student")
    ProposalResponse toProposalResponse(Proposal proposal);

    @Mapping(target = "student", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateProposal(@MappingTarget Proposal proposal, ProposalRequest request);
}