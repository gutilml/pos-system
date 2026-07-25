package com.pos.core.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record ReimburseLineRequestDTO(
        @NotNull UUID transactionItemId,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal quantity
) {
}
