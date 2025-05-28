package com.quan.project1.mapper;

import com.quan.project1.dto.response.ApplicationResponse;
import com.quan.project1.entity.Application;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring",uses = {StudentMapper.class, InternshipMapper.class})
public interface ApplicationMapper {
    @Mapping(target = "student", source = "student")
    @Mapping(target = "internship", source = "internship")
    @Mapping(target = "applicationID", source = "applicationID")
    ApplicationResponse toApplicationResponse(Application application);
}
