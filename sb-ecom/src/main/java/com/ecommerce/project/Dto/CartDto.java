package com.ecommerce.project.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long cartId;
    private Double totalPrice=0.0;
    private List<ProductDto> products = new ArrayList<>();
}
