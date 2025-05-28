package com.quan.project1.mapper;

import com.quan.project1.dto.request.CompanyRequest;
import com.quan.project1.dto.response.CompanyResponse;
import com.quan.project1.entity.Company;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = AccountMapper.class)
public interface CompanyMapper {
    Company toCompany(CompanyRequest request);

    @Mapping(target = "accountResponse", source = "account")
    CompanyResponse toCompanyResponse(Company company);

    @Mapping(target = "account", ignore = true)
    void updateCompany(@MappingTarget Company company, CompanyRequest request);
}
