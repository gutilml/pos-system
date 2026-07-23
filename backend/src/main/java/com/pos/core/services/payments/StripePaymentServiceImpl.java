package com.pos.core.services.payments;

import com.pos.core.dtos.payments.CheckoutSessionResponseDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Transaction;
import com.pos.core.models.TransactionItem;
import com.pos.core.models.TransactionStatus;
import com.pos.core.payments.StripeCheckoutClient;
import com.pos.core.payments.StripeMoney;
import com.pos.core.repositories.TransactionRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Transactional
public class StripePaymentServiceImpl implements StripePaymentService {

    public static final String CURRENCY_MXN = "mxn";
    public static final String EVENT_CHECKOUT_SESSION_COMPLETED = "checkout.session.completed";
    public static final String METADATA_TRANSACTION_ID = "transactionId";

    private final TransactionRepository transactionRepository;
    private final StripeCheckoutClient stripeCheckoutClient;
    private final String successUrl;
    private final String cancelUrl;

    public StripePaymentServiceImpl(
            TransactionRepository transactionRepository,
            StripeCheckoutClient stripeCheckoutClient,
            @Value("${stripe.success-url}") String successUrl,
            @Value("${stripe.cancel-url}") String cancelUrl
    ) {
        this.transactionRepository = transactionRepository;
        this.stripeCheckoutClient = stripeCheckoutClient;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }

    @Override
    public CheckoutSessionResponseDTO createCheckoutSession(UUID transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        if (transaction.getStatus() != TransactionStatus.IN_PROGRESS
                && transaction.getStatus() != TransactionStatus.HELD) {
            throw new BusinessRuleException(
                    "Checkout session requires transaction status IN_PROGRESS or HELD, was: "
                            + transaction.getStatus());
        }

        long amountCents = StripeMoney.toCents(transaction.getGrandTotal());
        if (amountCents <= 0) {
            throw new BusinessRuleException("Transaction grand total must be greater than zero for Stripe checkout");
        }

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .setClientReferenceId(transaction.getId().toString())
                .putMetadata(METADATA_TRANSACTION_ID, transaction.getId().toString())
                .addLineItem(buildPrimaryLineItem(transaction, amountCents));

        for (TransactionItem item : transaction.getItems()) {
            paramsBuilder.putMetadata(
                    "item_" + item.getId(),
                    item.getProduct() != null
                            ? (item.getProduct().resolvePrimarySku() != null
                            ? item.getProduct().resolvePrimarySku()
                            : item.getId().toString())
                            : item.getId().toString()
            );
        }

        try {
            Session session = stripeCheckoutClient.createSession(paramsBuilder.build());
            return new CheckoutSessionResponseDTO(session.getId(), session.getUrl());
        } catch (StripeException ex) {
            throw new BusinessRuleException("Failed to create Stripe Checkout Session: " + ex.getMessage());
        }
    }

    @Override
    public String handleWebhook(String payload, String sigHeader) {
        if (payload == null || payload.isBlank()) {
            throw new BusinessRuleException("Webhook payload is required");
        }
        if (sigHeader == null || sigHeader.isBlank()) {
            throw new BusinessRuleException("Stripe-Signature header is required");
        }

        final Event event;
        try {
            event = stripeCheckoutClient.constructEvent(payload, sigHeader);
        } catch (SignatureVerificationException ex) {
            throw new BusinessRuleException("Invalid Stripe webhook signature");
        }

        if (EVENT_CHECKOUT_SESSION_COMPLETED.equals(event.getType())) {
            Session session = deserializeSession(event);
            completeTransactionFromSession(session);
        }

        return event.getType();
    }

    private static SessionCreateParams.LineItem buildPrimaryLineItem(Transaction transaction, long amountCents) {
        String productName = "POS Transaction " + transaction.getId();
        return SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(CURRENCY_MXN)
                                .setUnitAmount(amountCents)
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName(productName)
                                                .build()
                                )
                                .build()
                )
                .build();
    }

    private static Session deserializeSession(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = deserializer.getObject()
                .orElseThrow(() -> new BusinessRuleException(
                        "Unable to deserialize checkout.session.completed payload"));
        if (stripeObject instanceof Session session) {
            return session;
        }
        throw new BusinessRuleException("checkout.session.completed payload was not a Session");
    }

    private void completeTransactionFromSession(Session session) {
        String transactionIdValue = null;
        if (session.getMetadata() != null) {
            transactionIdValue = session.getMetadata().get(METADATA_TRANSACTION_ID);
        }
        if (transactionIdValue == null || transactionIdValue.isBlank()) {
            transactionIdValue = session.getClientReferenceId();
        }
        if (transactionIdValue == null || transactionIdValue.isBlank()) {
            throw new BusinessRuleException("Checkout session is missing transaction reference");
        }

        UUID transactionId;
        try {
            transactionId = UUID.fromString(transactionIdValue);
        } catch (IllegalArgumentException ex) {
            throw new BusinessRuleException("Invalid transaction id on checkout session: " + transactionIdValue);
        }

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));

        if (transaction.getStatus() == TransactionStatus.COMPLETED) {
            return;
        }
        if (transaction.getStatus() != TransactionStatus.IN_PROGRESS
                && transaction.getStatus() != TransactionStatus.HELD) {
            throw new BusinessRuleException(
                    "Cannot complete transaction from webhook; status was " + transaction.getStatus());
        }

        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setAmountReceived(transaction.getGrandTotal());
        transaction.setChangeGiven(BigDecimal.ZERO.setScale(4));
    }
}
