package com.pos.core.controllers;

import com.pos.core.dtos.payments.CheckoutSessionResponseDTO;
import com.pos.core.services.payments.StripePaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final StripePaymentService stripePaymentService;

    public PaymentController(StripePaymentService stripePaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping("/checkout/{transactionId}")
    @ResponseStatus(HttpStatus.CREATED)
    public CheckoutSessionResponseDTO createCheckoutSession(@PathVariable UUID transactionId) {
        return stripePaymentService.createCheckoutSession(transactionId);
    }

    /**
     * Stripe webhooks must receive the raw body string for signature verification.
     */
    @PostMapping(value = "/webhook", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String stripeSignature
    ) {
        String eventType = stripePaymentService.handleWebhook(payload, stripeSignature);
        return ResponseEntity.ok(Map.of("received", "true", "type", eventType));
    }
}
