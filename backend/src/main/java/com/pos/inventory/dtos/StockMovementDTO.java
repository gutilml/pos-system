package com.pos.inventory.dtos;

import com.pos.inventory.models.StockMovementType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record StockMovementDTO(
        UUID id,
        UUID storeId,
        UUID productId,
        StockMovementType type,
        BigDecimal quantityDelta,
        BigDecimal quantityAfter,
        BigDecimal unitCostBefore,
        BigDecimal unitCostAfter,
        BigDecimal sellingBefore,
        BigDecimal sellingAfter,
        BigDecimal wholesaleBefore,
        BigDecimal wholesaleAfter,
        String reason,
        OffsetDateTime createdAt
) {
}
