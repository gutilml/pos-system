package com.pos.core.payments;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Converts POS money ({@code BigDecimal} scale 4) to Stripe's smallest currency unit (cents).
 */
public final class StripeMoney {

    public static final int CENTS_SCALE = 0;
    public static final RoundingMode CENTS_ROUNDING = RoundingMode.HALF_UP;

    private StripeMoney() {
    }

    /**
     * Multiplies by 100 and rounds half-up to a whole number of cents.
     *
     * @throws IllegalArgumentException if amount is null or negative
     * @throws ArithmeticException if the result does not fit in a {@code long}
     */
    public static long toCents(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("amount cannot be null");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amount cannot be negative");
        }
        return amount
                .multiply(BigDecimal.valueOf(100))
                .setScale(CENTS_SCALE, CENTS_ROUNDING)
                .longValueExact();
    }
}
