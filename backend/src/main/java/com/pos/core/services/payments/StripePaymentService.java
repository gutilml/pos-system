package com.pos.core.services.payments;

import com.pos.core.dtos.payments.CheckoutSessionResponseDTO;
import com.pos.core.models.Transaction;

import java.util.UUID;

public interface StripePaymentService {

    CheckoutSessionResponseDTO createCheckoutSession(UUID transactionId);

    /**
     * Verifies the Stripe signature and applies side effects for supported events.
     *
     * @return Stripe event type that was processed (or acknowledged)
     */
    String handleWebhook(String payload, String sigHeader);
}
