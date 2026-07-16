package com.pos.core.repositories;

import com.pos.core.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("""
            SELECT MAX(c.targetMargin)
            FROM Product p
            JOIN p.categories c
            WHERE p.id = :productId
            """)
    Optional<BigDecimal> findHighestTargetMarginByProductId(@Param("productId") UUID productId);
}
