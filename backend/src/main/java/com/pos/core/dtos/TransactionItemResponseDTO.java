package com.pos.core.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record TransactionItemResponseDTO(
        UUID id,
        UUID productId,
        BigDecimal quantity,
        BigDecimal priceAtTime,
        BigDecimal lineTotal
) {
}
