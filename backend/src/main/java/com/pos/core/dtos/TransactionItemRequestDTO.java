package com.pos.core.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record TransactionItemRequestDTO(
        @NotNull UUID productId,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal quantity,
        /**
         * Optional line discount as a decimal fraction (e.g. 0.10 for 10% off this line).
         */
        @DecimalMin(value = "0.0000", inclusive = true)
        @DecimalMax(value = "1.0000", inclusive = true)
        BigDecimal itemDiscountPercentage
) {
}
