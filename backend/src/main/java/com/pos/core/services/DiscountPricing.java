package com.pos.core.services;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Cascading discount math: item-level first, then global on eligible lines only.
 * All intermediate steps use scale 4 HALF_UP; persisted totals follow {@link TransactionServiceImpl#MONEY_SCALE}.
 */
final class DiscountPricing {

    private DiscountPricing() {
    }

    static BigDecimal normalizePercentage(BigDecimal percentage) {
        if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);
        }
        return percentage.setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);
    }

    static BigDecimal applyDiscount(BigDecimal amount, BigDecimal discountPercentage, RoundingMode rounding) {
        BigDecimal base = amount.setScale(TransactionServiceImpl.MONEY_SCALE, rounding);
        BigDecimal pct = normalizePercentage(discountPercentage);
        if (pct.compareTo(BigDecimal.ZERO) <= 0) {
            return base;
        }
        BigDecimal discountAmount = base.multiply(pct).setScale(TransactionServiceImpl.MONEY_SCALE, rounding);
        return base.subtract(discountAmount).setScale(TransactionServiceImpl.MONEY_SCALE, rounding);
    }

    static PricedLine priceLine(
            BigDecimal originalUnitPrice,
            BigDecimal quantity,
            BigDecimal itemDiscountPercentage,
            BigDecimal globalDiscountPercentage,
            boolean excludeFromGlobalDiscounts
    ) {
        BigDecimal original = originalUnitPrice.setScale(
                TransactionServiceImpl.MONEY_SCALE,
                TransactionServiceImpl.MONEY_ROUNDING
        );
        BigDecimal qty = quantity.setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);
        BigDecimal itemPct = normalizePercentage(itemDiscountPercentage);

        BigDecimal afterItemDiscount = applyDiscount(original, itemPct, TransactionServiceImpl.MONEY_ROUNDING);

        BigDecimal finalUnitPrice;
        if (excludeFromGlobalDiscounts
                || globalDiscountPercentage == null
                || globalDiscountPercentage.compareTo(BigDecimal.ZERO) <= 0) {
            finalUnitPrice = afterItemDiscount;
        } else {
            finalUnitPrice = applyDiscount(
                    afterItemDiscount,
                    globalDiscountPercentage,
                    TransactionServiceImpl.MONEY_ROUNDING
            );
        }

        BigDecimal originalLineTotal = original.multiply(qty)
                .setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);
        BigDecimal lineTotal = finalUnitPrice.multiply(qty)
                .setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);
        BigDecimal lineDiscount = originalLineTotal.subtract(lineTotal)
                .setScale(TransactionServiceImpl.MONEY_SCALE, TransactionServiceImpl.MONEY_ROUNDING);

        return new PricedLine(original, itemPct, finalUnitPrice, lineTotal, lineDiscount);
    }

    record PricedLine(
            BigDecimal originalUnitPrice,
            BigDecimal itemDiscountPercentage,
            BigDecimal finalUnitPrice,
            BigDecimal lineTotal,
            BigDecimal lineDiscountAmount
    ) {
    }
}
