package com.pos.customers.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CustomerPaymentRequestDTO(
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal amount
) {
}
