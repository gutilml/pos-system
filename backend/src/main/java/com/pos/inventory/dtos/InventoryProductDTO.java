package com.pos.inventory.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record InventoryProductDTO(
        UUID productId,
        String name,
        String primarySku,
        UUID stockedProductId,
        UUID parentProductId,
        boolean trackInventory,
        BigDecimal currentStock,
        BigDecimal lowStockThreshold,
        boolean lowStock,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        BigDecimal wholesalePrice,
        BigDecimal targetMargin,
        BigDecimal wholesaleMargin
) {
}
