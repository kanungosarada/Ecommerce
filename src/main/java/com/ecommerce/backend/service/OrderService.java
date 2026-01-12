package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    OrderRepository orderRepository;

    @Autowired
    CartService cartService;
    
    @Autowired
    ProductRepository productRepository;

    @Transactional
    public Order checkout(Long userId) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate total and create order items
        BigDecimal totalPrice = BigDecimal.ZERO;
        List<OrderItem> orderItems = new java.util.ArrayList<>();
        
        Order order = Order.builder()
                .user(cart.getUser())
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        
        for (CartItem cartItem : cart.getItems()) {
             Product product = cartItem.getProduct();
             // Check stock
             if (product.getStock() < cartItem.getQuantity()) {
                 throw new RuntimeException("Not enough stock for product: " + product.getName());
             }
             
             // Deduct stock (Optimistic locking handle by Version)
             product.setStock(product.getStock() - cartItem.getQuantity());
             productRepository.save(product);
             
             BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
             totalPrice = totalPrice.add(itemTotal);
             
             orderItems.add(OrderItem.builder()
                     .order(order)
                     .product(product)
                     .quantity(cartItem.getQuantity())
                     .price(product.getPrice())
                     .build());
        }

        order.setTotalPrice(totalPrice);
        order.setItems(orderItems);
        
        Order savedOrder = orderRepository.save(order);
        
        // Clear cart
        cartService.clearCart(userId);
        
        return savedOrder;
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }
}
