package com.quan.project1.controller;

import com.nimbusds.jose.JOSEException;
import com.quan.project1.dto.request.IntrospectRequest;
import com.quan.project1.dto.request.LoginRequest;
// import com.quan.project1.dto.response.ApiResponse; // Đã xóa import ApiResponse nếu không còn dùng
import com.quan.project1.dto.response.IntrospectResponse;
import com.quan.project1.dto.response.LoginResponse;
import com.quan.project1.service.LoginService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LoginController
{
    LoginService loginService;

    @PostMapping("/login")
    LoginResponse login(@RequestBody LoginRequest request)
    {
        return loginService.authenticate(request);
    }

    @PostMapping("/introspect")
    IntrospectResponse authenicate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        return loginService.introspect(request);
    }
}