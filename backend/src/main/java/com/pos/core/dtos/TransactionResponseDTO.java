package com.pos.core.dtos;

import com.pos.core.models.TransactionStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record TransactionResponseDTO(
        UUID id,
        UUID storeId,
        UUID shiftId,
        UUID customerId,
        TransactionStatus status,
        BigDecimal subtotal,
        BigDecimal taxTotal,
        BigDecimal grandTotal,
        BigDecimal globalDiscountPercentage,
        BigDecimal totalDiscountAmount,
        BigDecimal amountReceived,
        BigDecimal changeGiven,
        List<PaymentResponseDTO> payments,
        List<TransactionItemResponseDTO> items,
        OffsetDateTime createdAt
) {
}
