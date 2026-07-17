package com.pos.customers.dtos;

import com.pos.customers.models.CreditLedgerEntryType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreditLedgerEntryDTO(
        UUID id,
        UUID customerId,
        UUID transactionId,
        BigDecimal amount,
        CreditLedgerEntryType type,
        OffsetDateTime createdAt
) {
}
