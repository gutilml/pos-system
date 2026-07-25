package com.pos.core.pricing;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class ProductPricingTest {

    @Test
    void backfillTargetMargin_derivesWhenCurrentNullAndPricesValid() {
        BigDecimal margin = ProductPricing.backfillTargetMargin(
                new BigDecimal("3.5000"),
                new BigDecimal("8.0000"),
                null
        );
        assertThat(margin).isEqualByComparingTo("0.5625");
    }

    @Test
    void backfillTargetMargin_keepsExistingMargin() {
        BigDecimal existing = new BigDecimal("0.3000");
        BigDecimal margin = ProductPricing.backfillTargetMargin(
                new BigDecimal("70.0000"),
                new BigDecimal("100.0000"),
                existing
        );
        assertThat(margin).isSameAs(existing);
    }

    @Test
    void backfillTargetMargin_skipsWhenCostNotPositive() {
        assertThat(ProductPricing.backfillTargetMargin(
                BigDecimal.ZERO, new BigDecimal("10.0000"), null)).isNull();
        assertThat(ProductPricing.backfillTargetMargin(
                new BigDecimal("-1.0000"), new BigDecimal("10.0000"), null)).isNull();
    }

    @Test
    void backfillTargetMargin_skipsWhenSellingNotPositive() {
        assertThat(ProductPricing.backfillTargetMargin(
                new BigDecimal("5.0000"), BigDecimal.ZERO, null)).isNull();
    }

    @Test
    void backfillTargetMargin_skipsWhenCostExceedsSelling() {
        assertThat(ProductPricing.backfillTargetMargin(
                new BigDecimal("12.0000"), new BigDecimal("10.0000"), null)).isNull();
    }

    @Test
    void backfillTargetMargin_skipsWhenPricesNull() {
        assertThat(ProductPricing.backfillTargetMargin(null, new BigDecimal("10.0000"), null)).isNull();
        assertThat(ProductPricing.backfillTargetMargin(new BigDecimal("5.0000"), null, null)).isNull();
    }
}
