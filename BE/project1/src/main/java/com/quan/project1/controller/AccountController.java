package com.quan.project1.controller;

import com.quan.project1.dto.request.AccountRequest;
import com.quan.project1.dto.response.AccountResponse;
// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse nếu không còn dùng
import com.quan.project1.entity.Account;
import com.quan.project1.service.AccountService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/accounts")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AccountController {
    AccountService accountService;

    @PostMapping
    Account createAccount(@RequestBody @Valid AccountRequest request){
        return accountService.createAccount(request);
    }

    @GetMapping("/list")
    List<Account> getUsers()
    {
        List<Account> accounts = new ArrayList<>();
        accounts = accountService.getAllAccount();
        return accounts;
    }

    @GetMapping("/{accountID}")
    AccountResponse getUser(@PathVariable("accountID") String accountID)
    {
        return accountService.getAccount(accountID);
    }

    @GetMapping("/myInfo")
    AccountResponse getMyInfo()
    {
        return accountService.getMyInfo();
    }

    @PutMapping("/{accountID}")
    AccountResponse updateUser(@PathVariable("accountID") String accountID, @RequestBody AccountRequest request)
    {
        return accountService.updateAccount(accountID, request);
    }

    @DeleteMapping("/{accountID}")
    void deleteUser(@PathVariable("accountID") String accountID)
    {
        accountService.deleteAccount(accountID);
    }
}