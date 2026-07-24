package com.pos.core.dtos;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductRequestDTO(
        List<String> skus,
        String primarySku,
        @NotBlank String name,
        String description,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        BigDecimal wholesalePrice,
        BigDecimal targetMargin,
        UUID categoryId,
        List<UUID> categoryIds,
        Boolean sellByWeight,
        String unitOfMeasure,
        UUID parentProductId,
        BigDecimal qtyPerPackage,
        String packageUnit,
        Boolean trackInventory,
        BigDecimal currentStock,
        BigDecimal lowStockThreshold,
        Boolean active,
        Boolean excludeFromGlobalDiscounts
) {
}
