package com.pos.core.dtos.shift;

import com.pos.core.models.CashDrawerEventType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CashDrawerEventRequestDTO(
        @NotNull CashDrawerEventType type,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal amount,
        @NotBlank String reason
) {
}
