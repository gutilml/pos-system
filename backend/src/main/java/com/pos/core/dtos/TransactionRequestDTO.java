package com.pos.core.dtos;

import jakarta.validation.Valid;
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
        UUID customerId
) {
}
