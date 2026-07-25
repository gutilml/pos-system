package com.pos.inventory.dtos;

import com.pos.inventory.models.StockMovementType;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record StockMovementRequestDTO(
        @NotNull UUID storeId,
        @NotNull UUID productId,
        @NotNull StockMovementType type,
        /** RECEIVING: positive qty to add. ADJUSTMENT: signed delta (may be negative). */
        @NotNull BigDecimal quantity,
        String reason,
        /** RECEIVING only; when present and different from current cost, blend prices. */
        BigDecimal unitCost,
        BigDecimal sellingPrice,
        BigDecimal wholesalePrice
) {
}
