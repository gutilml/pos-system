package com.pos.core.dtos.shift;

import com.pos.core.models.CashDrawerEventType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CashDrawerEventDTO(
        UUID id,
        UUID shiftId,
        CashDrawerEventType type,
        BigDecimal amount,
        String reason,
        OffsetDateTime createdAt
) {
}
