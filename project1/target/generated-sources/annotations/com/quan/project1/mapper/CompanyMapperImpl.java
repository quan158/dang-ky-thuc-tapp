package com.quan.project1.mapper;

import com.quan.project1.dto.request.CompanyRequest;
import com.quan.project1.dto.response.CompanyResponse;
import com.quan.project1.entity.Company;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class CompanyMapperImpl implements CompanyMapper {

    @Autowired
    private AccountMapper accountMapper;

    @Override
    public Company toCompany(CompanyRequest request) {
        if ( request == null ) {
            return null;
        }

        Company.CompanyBuilder company = Company.builder();

        company.companyName( request.getCompanyName() );
        company.phone( request.getPhone() );
        company.address( request.getAddress() );
        company.email( request.getEmail() );
        company.companyWebsite( request.getCompanyWebsite() );
        company.avatar( request.getAvatar() );

        return company.build();
    }

    @Override
    public CompanyResponse toCompanyResponse(Company company) {
        if ( company == null ) {
            return null;
        }

        CompanyResponse.CompanyResponseBuilder companyResponse = CompanyResponse.builder();

        companyResponse.accountResponse( accountMapper.toAccountResponse( company.getAccount() ) );
        companyResponse.companyID( company.getCompanyID() );
        companyResponse.companyName( company.getCompanyName() );
        companyResponse.phone( company.getPhone() );
        companyResponse.address( company.getAddress() );
        companyResponse.email( company.getEmail() );
        companyResponse.companyWebsite( company.getCompanyWebsite() );
        companyResponse.avatar( company.getAvatar() );

        return companyResponse.build();
    }

    @Override
    public void updateCompany(Company company, CompanyRequest request) {
        if ( request == null ) {
            return;
        }

        company.setCompanyName( request.getCompanyName() );
        company.setPhone( request.getPhone() );
        company.setAddress( request.getAddress() );
        company.setEmail( request.getEmail() );
        company.setCompanyWebsite( request.getCompanyWebsite() );
        company.setAvatar( request.getAvatar() );
    }
}
