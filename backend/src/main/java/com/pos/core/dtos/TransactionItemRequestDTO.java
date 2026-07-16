package com.pos.core.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record TransactionItemRequestDTO(
        @NotNull UUID productId,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal quantity
) {
}
