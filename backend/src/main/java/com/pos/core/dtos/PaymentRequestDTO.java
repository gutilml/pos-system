package com.pos.core.dtos;

import com.pos.core.models.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentRequestDTO(
        @NotNull PaymentType paymentMethod,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal amount
) {
}
