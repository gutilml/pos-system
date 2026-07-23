package com.pos.core.dtos.shift;

import com.pos.core.models.ShiftStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ShiftDTO(
        UUID id,
        UUID storeId,
        ShiftStatus status,
        BigDecimal startingCash,
        BigDecimal expectedCash,
        BigDecimal actualCash,
        BigDecimal discrepancy,
        OffsetDateTime openedAt,
        OffsetDateTime closedAt,
        BigDecimal totalCashPayments,
        BigDecimal totalCardPayments,
        BigDecimal totalCreditPayments,
        BigDecimal totalSalesGrandTotal
) {
}
