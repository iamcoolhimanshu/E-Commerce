package com.ecommerce.project.Dto;

import java.util.HashSet;
import java.util.Set;

import com.ecommerce.project.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long userId;
    private String username;
    private String email;
    private String password;
    private Set<Role> roles = new HashSet<>();
    private AddressDto address;
    private CartDto cart;
}