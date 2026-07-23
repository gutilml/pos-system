package com.pos.core.repositories;

import com.pos.core.models.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    @Query("""
            SELECT p FROM Product p
            JOIN p.skus s
            WHERE p.active = true
              AND LOWER(s.code) = LOWER(:code)
            """)
    Optional<Product> findActiveByCodeIgnoreCase(@Param("code") String code);

    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN p.skus s
            WHERE p.active = true
              AND (
                   LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(s.code) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            ORDER BY p.name ASC
            """)
    List<Product> searchActiveByNameOrCode(@Param("q") String q, Pageable pageable);

    @Query("""
            SELECT MAX(c.targetMargin)
            FROM Product p
            JOIN p.categories c
            WHERE p.id = :productId
            """)
    Optional<BigDecimal> findHighestTargetMarginByProductId(@Param("productId") UUID productId);
}
