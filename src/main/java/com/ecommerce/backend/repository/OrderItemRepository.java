package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    void deleteByProduct(Product product);
}
