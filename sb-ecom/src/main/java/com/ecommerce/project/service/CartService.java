package com.ecommerce.project.service;

import com.ecommerce.project.Dto.CartDto;
import com.ecommerce.project.Dto.CartItemDto;
import jakarta.transaction.Transactional;

import java.util.List;

public interface CartService {

    CartDto addProductToCart(Long productId, Integer quantity);

    List<CartDto> getAllCarts();

    CartDto getCart(String emailId, Long cartId);

    @Transactional
    CartDto updateProductQuantityInCart(Long productId, Integer quantity);

    String deleteProductFromCart(Long cartId, Long productId);

    void updateProductInCarts(Long cartId, Long productId);

    String createOrUpdateCartWithItems(List<CartItemDto> cartItems);
}
