package com.pos.core.dtos.payments;

public record CheckoutSessionResponseDTO(
        String sessionId,
        String checkoutUrl
) {
}
