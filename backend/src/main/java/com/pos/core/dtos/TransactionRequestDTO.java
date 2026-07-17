package com.pos.core.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TransactionRequestDTO(
        UUID storeId,
        @NotEmpty @Valid List<TransactionItemRequestDTO> items,
        /**
         * One entry per tender. Amounts must sum to at least the server-computed
         * grand total; only CASH may overpay (the excess is returned as change).
         */
        @NotEmpty @Valid List<PaymentRequestDTO> payments,
        /**
         * Optional tax rate as a decimal fraction (e.g. 0.0825 for 8.25%).
         * Defaults to zero when omitted — totals are still recalculated server-side.
         */
        BigDecimal taxRate,
        /** Required when any payment uses CREDIT. */
        UUID customerId,
        /**
         * Optional cart-wide discount as a decimal fraction (e.g. 0.10 for 10%).
         * Applied after item discounts and skipped for products flagged excludeFromGlobalDiscounts.
         */
        @DecimalMin(value = "0.0000", inclusive = true)
        @DecimalMax(value = "1.0000", inclusive = true)
        BigDecimal globalDiscountPercentage
) {
}
