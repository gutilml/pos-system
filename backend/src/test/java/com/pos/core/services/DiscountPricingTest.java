package com.pos.core.services;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class DiscountPricingTest {

    @Test
    void priceLine_skipsGlobalWhenLineHasItemDiscount() {
        // 10% item on $100 → $90; global does not stack on item-discounted lines.
        DiscountPricing.PricedLine line = DiscountPricing.priceLine(
                new BigDecimal("100.0000"),
                new BigDecimal("1.0000"),
                new BigDecimal("0.1000"),
                new BigDecimal("0.1000"),
                false
        );

        assertThat(line.finalUnitPrice()).isEqualByComparingTo("90.0000");
        assertThat(line.lineDiscountAmount()).isEqualByComparingTo("10.0000");
    }

    @Test
    void priceLine_appliesGlobalOnlyWhenNoItemDiscountAndNotExcluded() {
        DiscountPricing.PricedLine eligible = DiscountPricing.priceLine(
                new BigDecimal("10.0000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                false
        );

        assertThat(eligible.finalUnitPrice()).isEqualByComparingTo("9.0000");
    }

    @Test
    void priceLine_skipsGlobalDiscountWhenProductIsExcluded() {
        DiscountPricing.PricedLine excluded = DiscountPricing.priceLine(
                new BigDecimal("10.0000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                true
        );

        assertThat(excluded.finalUnitPrice()).isEqualByComparingTo("10.0000");
    }

    @Test
    void priceLine_mixedCartItemDiscountAndGlobalOnDifferentLines() {
        // Cola: 10% item only (global skipped). Chips: 10% global only. Special: product excluded.
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
                false
        );
        DiscountPricing.PricedLine special = DiscountPricing.priceLine(
                new BigDecimal("2.5000"),
                new BigDecimal("1.0000"),
                BigDecimal.ZERO,
                new BigDecimal("0.1000"),
                true
        );

        assertThat(cola.finalUnitPrice()).isEqualByComparingTo("1.7910");
        assertThat(chips.finalUnitPrice()).isEqualByComparingTo("2.2500");
        assertThat(special.finalUnitPrice()).isEqualByComparingTo("2.5000");

        BigDecimal subtotal = cola.lineTotal().add(chips.lineTotal()).add(special.lineTotal());
        BigDecimal totalDiscount = cola.lineDiscountAmount()
                .add(chips.lineDiscountAmount())
                .add(special.lineDiscountAmount());

        assertThat(subtotal).isEqualByComparingTo("6.5410");
        assertThat(totalDiscount).isEqualByComparingTo("0.4490");
    }
}
