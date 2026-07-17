package com.pos.core.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record TransactionItemResponseDTO(
        UUID id,
        UUID productId,
        BigDecimal quantity,
        BigDecimal priceAtTime,
        BigDecimal originalUnitPrice,
        BigDecimal itemDiscountPercentage,
        BigDecimal finalUnitPrice,
        BigDecimal lineTotal
) {
}
