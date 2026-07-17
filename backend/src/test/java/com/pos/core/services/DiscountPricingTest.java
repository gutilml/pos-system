package com.pos.core.services;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DiscountPricingTest {

    @Test
    void priceLine_appliesItemThenGlobalDiscountInCascade() {
        // Spec example: 10% item on $100 → $90, then 10% global → $81.
        DiscountPricing.PricedLine line = DiscountPricing.priceLine(
                new BigDecimal("100.0000"),
                new BigDecimal("1.0000"),
                new BigDecimal("0.1000"),
                new BigDecimal("0.1000"),
                false
        );

        assertThat(line.originalUnitPrice()).isEqualByComparingTo("100.0000");
        assertThat(line.finalUnitPrice()).isEqualByComparingTo("81.0000");
        assertThat(line.lineTotal()).isEqualByComparingTo("81.0000");
        assertThat(line.lineDiscountAmount()).isEqualByComparingTo("19.0000");
    }

    @Test
    void priceLine_skipsGlobalDiscountWhenProductIsExcluded() {
        DiscountPricing.PricedLine eligible = DiscountPricing.priceLine(
                new BigDecimal("10.0000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                false
        );
        DiscountPricing.PricedLine excluded = DiscountPricing.priceLine(
                new BigDecimal("10.0000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                true
        );

        assertThat(eligible.finalUnitPrice()).isEqualByComparingTo("9.0000");
        assertThat(excluded.finalUnitPrice()).isEqualByComparingTo("10.0000");
    }

    @Test
    void priceLine_mixedCartWithItemAndGlobalDiscounts() {
        // Cola $1.99 with 10% item + 10% global; chips $2.50 excluded from global.
        DiscountPricing.PricedLine cola = DiscountPricing.priceLine(
                new BigDecimal("1.9900"),
                new BigDecimal("1.0000"),
                new BigDecimal("0.1000"),
                new BigDecimal("0.1000"),
                false
        );
        DiscountPricing.PricedLine chips = DiscountPricing.priceLine(
                new BigDecimal("2.5000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                true
        );

        assertThat(cola.finalUnitPrice()).isEqualByComparingTo("1.6119");
        assertThat(chips.finalUnitPrice()).isEqualByComparingTo("2.5000");

        BigDecimal subtotal = cola.lineTotal().add(chips.lineTotal());
        BigDecimal totalDiscount = cola.lineDiscountAmount().add(chips.lineDiscountAmount());

        assertThat(subtotal).isEqualByComparingTo("4.1119");
        assertThat(totalDiscount).isEqualByComparingTo("0.3781");
    }
}
