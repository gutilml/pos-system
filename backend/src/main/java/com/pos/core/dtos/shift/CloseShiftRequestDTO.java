package com.pos.core.dtos.shift;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CloseShiftRequestDTO(
        @NotNull @DecimalMin(value = "0.0000", inclusive = true) BigDecimal actualCash
) {
}
