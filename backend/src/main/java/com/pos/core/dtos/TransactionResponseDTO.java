package com.pos.core.dtos;

import com.pos.core.models.PaymentType;
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
        PaymentType paymentType,
        TransactionStatus status,
        BigDecimal subtotal,
        BigDecimal taxTotal,
        BigDecimal grandTotal,
        BigDecimal amountReceived,
        BigDecimal changeGiven,
        List<TransactionItemResponseDTO> items,
        OffsetDateTime createdAt
) {
}
