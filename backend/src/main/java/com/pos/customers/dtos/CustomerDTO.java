package com.pos.customers.dtos;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CustomerDTO(
        UUID id,
        UUID storeId,
        String name,
        String phone,
        BigDecimal creditLimit,
        BigDecimal currentBalance,
        OffsetDateTime createdAt
) {
}
