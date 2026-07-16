package com.pos.core.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TransactionRequestDTO(
        UUID storeId,
        @NotEmpty @Valid List<TransactionItemRequestDTO> items,
        @NotNull @DecimalMin(value = "0.0000", inclusive = true) BigDecimal amountReceived,
        /**
         * Optional tax rate as a decimal fraction (e.g. 0.0825 for 8.25%).
         * Defaults to zero when omitted — totals are still recalculated server-side.
         */
        BigDecimal taxRate
) {
}
