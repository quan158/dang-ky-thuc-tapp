package com.quan.project1.mapper;

import com.quan.project1.dto.request.InternshipRequest;
import com.quan.project1.dto.response.InternshipResponse;
import com.quan.project1.entity.Internship;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = CompanyMapper.class)
public interface InternshipMapper {
    Internship toInternship(InternshipRequest request);

    @Mapping(target = "companyResponse", source = "company")
    InternshipResponse toInternshipResponse(Internship internship);

    @Mapping(target = "company", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updateInternship(@MappingTarget Internship internship, InternshipRequest request);
}
