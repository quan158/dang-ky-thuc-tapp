package com.quan.project1.mapper;

import com.quan.project1.dto.request.AccountRequest;
import com.quan.project1.dto.response.AccountResponse;
import com.quan.project1.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AccountMapper {
    @Mapping(target = "accountID", ignore = true)
    @Mapping(target = "roles", ignore = true)
    Account toAccount(AccountRequest request);

    @Mapping(target = "createAt", ignore = true)
    void updateAccount(@MappingTarget Account account, AccountRequest request);

    AccountResponse toAccountResponse(Account account);
}
