package com.pos.core.payments;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StripeMoneyTest {

    @Test
    void toCents_multipliesBy100WithHalfUp() {
        assertThat(StripeMoney.toCents(new BigDecimal("19.9900"))).isEqualTo(1999L);
        assertThat(StripeMoney.toCents(new BigDecimal("1.9940"))).isEqualTo(199L);
        assertThat(StripeMoney.toCents(new BigDecimal("1.9950"))).isEqualTo(200L);
        assertThat(StripeMoney.toCents(new BigDecimal("0.0050"))).isEqualTo(1L);
        assertThat(StripeMoney.toCents(new BigDecimal("0.0049"))).isEqualTo(0L);
        assertThat(StripeMoney.toCents(BigDecimal.ZERO.setScale(4))).isEqualTo(0L);
    }

    @Test
    void toCents_rejectsNullAndNegative() {
        assertThatThrownBy(() -> StripeMoney.toCents(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> StripeMoney.toCents(new BigDecimal("-0.0100")))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
