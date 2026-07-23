package com.pos.core.repositories;

import com.pos.core.models.ProductSku;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductSkuRepository extends JpaRepository<ProductSku, UUID> {

    Optional<ProductSku> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndProductIdNot(String code, UUID productId);
}
