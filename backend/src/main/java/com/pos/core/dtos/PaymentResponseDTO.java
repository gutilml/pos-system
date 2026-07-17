package com.pos.core.dtos;

import com.pos.core.models.PaymentType;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponseDTO(
        UUID id,
        PaymentType paymentMethod,
        BigDecimal amount
) {
}
