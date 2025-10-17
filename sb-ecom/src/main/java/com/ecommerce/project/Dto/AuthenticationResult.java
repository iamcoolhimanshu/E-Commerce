package com.ecommerce.project.Dto;


import com.ecommerce.project.security.response.UserInfoResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseCookie;

@Data
@AllArgsConstructor
public class AuthenticationResult {

    private final UserInfoResponse response;
    private final ResponseCookie jwtCookie;
}

