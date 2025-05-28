package com.quan.project1.mapper;

import com.quan.project1.dto.request.AccountRequest;
import com.quan.project1.dto.response.AccountResponse;
import com.quan.project1.entity.Account;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-05-22T22:29:55+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.3 (Oracle Corporation)"
)
@Component
public class AccountMapperImpl implements AccountMapper {

    @Override
    public Account toAccount(AccountRequest request) {
        if ( request == null ) {
            return null;
        }

        Account.AccountBuilder account = Account.builder();

        account.username( request.getUsername() );
        account.password( request.getPassword() );
        account.email( request.getEmail() );
        account.fullname( request.getFullname() );
        account.status( request.getStatus() );

        return account.build();
    }

    @Override
    public void updateAccount(Account account, AccountRequest request) {
        if ( request == null ) {
            return;
        }

        account.setUsername( request.getUsername() );
        account.setPassword( request.getPassword() );
        account.setEmail( request.getEmail() );
        account.setFullname( request.getFullname() );
        account.setStatus( request.getStatus() );
        if ( account.getRoles() != null ) {
            Set<String> set = request.getRoles();
            if ( set != null ) {
                account.getRoles().clear();
                account.getRoles().addAll( set );
            }
            else {
                account.setRoles( null );
            }
        }
        else {
            Set<String> set = request.getRoles();
            if ( set != null ) {
                account.setRoles( new LinkedHashSet<String>( set ) );
            }
        }
    }

    @Override
    public AccountResponse toAccountResponse(Account account) {
        if ( account == null ) {
            return null;
        }

        AccountResponse.AccountResponseBuilder accountResponse = AccountResponse.builder();

        accountResponse.accountID( account.getAccountID() );
        accountResponse.username( account.getUsername() );
        accountResponse.email( account.getEmail() );
        accountResponse.fullname( account.getFullname() );
        accountResponse.createAt( account.getCreateAt() );
        accountResponse.status( account.getStatus() );
        Set<String> set = account.getRoles();
        if ( set != null ) {
            accountResponse.roles( new LinkedHashSet<String>( set ) );
        }

        return accountResponse.build();
    }
}
