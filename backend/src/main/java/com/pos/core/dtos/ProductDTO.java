package com.pos.core.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDTO(
        UUID id,
        String sku,
        String primarySku,
        List<String> skus,
        String name,
        String description,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        BigDecimal wholesalePrice,
        BigDecimal targetMargin,
        BigDecimal effectiveMargin,
        Boolean active,
        List<UUID> categoryIds,
        Boolean sellByWeight,
        String unitOfMeasure,
        UUID parentProductId,
        BigDecimal qtyPerPackage,
        String packageUnit,
        Boolean excludeFromGlobalDiscounts,
        Boolean trackInventory,
        BigDecimal currentStock,
        BigDecimal lowStockThreshold,
        /** Product whose stock is shown/deducted (self or parent). Null when inventory not applicable. */
        UUID stockedProductId,
        /** Sellable quantity in this product's sell unit (parent packages converted for children). */
        BigDecimal availableSellUnits
) {
    /**
     * {@code sku} is a transitional alias of {@code primarySku} (nullable when the product has no codes).
     * Parent package: {@code qtyPerPackage}/{@code packageUnit} map to entity unitsPerPackage/unitOfMeasure.
     * Feature 112: {@code stockedProductId}/{@code availableSellUnits} drive register Inv for children.
     */
}
