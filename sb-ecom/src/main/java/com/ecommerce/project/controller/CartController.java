package com.ecommerce.project.controller;

import com.ecommerce.project.Dto.CartDto;
import com.ecommerce.project.Dto.CartItemDto;
import com.ecommerce.project.entity.Cart;
import com.ecommerce.project.repository.CartRepository;
import com.ecommerce.project.service.CartService;
import com.ecommerce.project.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CartController {
    @Autowired
    private CartService cartService;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private AuthUtil authutil;

    @PostMapping("/carts/create")
    public ResponseEntity<String> createOrUpdateCart(@RequestBody List<CartItemDto> cartItems) {
       String response = cartService.createOrUpdateCartWithItems(cartItems);
        return new ResponseEntity<String>(response, HttpStatus.CREATED);
    }

    @PostMapping("/carts/products/{productId}/quantity/{quantity}")
    public ResponseEntity<CartDto> addProductToCart(@PathVariable Long productId, @PathVariable Integer quantity) {
        CartDto cartDto = cartService.addProductToCart(productId, quantity);
        return new ResponseEntity<CartDto>(cartDto, HttpStatus.CREATED);
    }

    @GetMapping("/carts")
    public ResponseEntity<List<CartDto>> getCarts() {
        List<CartDto> cartDtos = cartService.getAllCarts();
        return new ResponseEntity<List<CartDto>>(cartDtos, HttpStatus.FOUND);
    }

    @GetMapping("/carts/users/cart")
    public ResponseEntity<CartDto> getCartById() {
        String emailId = authutil.loggedInEmail();
        Cart cart = cartRepository.findCartByEmail(emailId);
        Long cartId = cart.getCartId();
        CartDto cartDTO = cartService.getCart(emailId, cartId);
        return new ResponseEntity<CartDto>(cartDTO, HttpStatus.OK);
    }

    @PutMapping("/cart/products/{productId}/quantity/{operation}")
    public ResponseEntity<CartDto> updateCartProduct(@PathVariable Long productId,
                                                     @PathVariable String operation) {
        CartDto cartDTO = cartService.updateProductQuantityInCart(productId, operation.equalsIgnoreCase("delete") ? -1 : 1);
        return new ResponseEntity<CartDto>(cartDTO, HttpStatus.OK);
    }

    @DeleteMapping("/carts/{cartId}/product/{productId}")
    public ResponseEntity<String> deleteProductFromCart(@PathVariable Long cartId,@PathVariable Long productId) {
        String status = cartService.deleteProductFromCart(cartId, productId);
        return new ResponseEntity<String>(status, HttpStatus.OK);
    }

}
