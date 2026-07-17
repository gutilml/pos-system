package com.pos.core.dtos.shift;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record OpenShiftRequestDTO(
        @NotNull UUID storeId,
        @NotNull @DecimalMin(value = "0.0000", inclusive = true) BigDecimal startingCash
) {
}
