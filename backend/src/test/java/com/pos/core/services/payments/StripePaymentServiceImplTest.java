package com.pos.core.services.payments;

import com.pos.core.dtos.payments.CheckoutSessionResponseDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Transaction;
import com.pos.core.models.TransactionStatus;
import com.pos.core.payments.StripeCheckoutClient;
import com.pos.core.repositories.TransactionRepository;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StripePaymentServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private StripeCheckoutClient stripeCheckoutClient;

    private StripePaymentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new StripePaymentServiceImpl(
                transactionRepository,
                stripeCheckoutClient,
                "http://localhost/success?session_id={CHECKOUT_SESSION_ID}",
                "http://localhost/cancel"
        );
    }

    @Test
    void createCheckoutSession_sendsGrandTotalAsMxnCents() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        Transaction transaction = openTransaction(txId, new BigDecimal("19.9940"));

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(transaction));

        Session session = new Session();
        session.setId("cs_test_123");
        session.setUrl("https://checkout.stripe.com/c/pay/cs_test_123");
        when(stripeCheckoutClient.createSession(any(SessionCreateParams.class))).thenReturn(session);

        CheckoutSessionResponseDTO response = service.createCheckoutSession(txId);

        assertThat(response.sessionId()).isEqualTo("cs_test_123");
        assertThat(response.checkoutUrl()).contains("cs_test_123");

        ArgumentCaptor<SessionCreateParams> captor = ArgumentCaptor.forClass(SessionCreateParams.class);
        verify(stripeCheckoutClient).createSession(captor.capture());
        SessionCreateParams params = captor.getValue();

        assertThat(params.getMode()).isEqualTo(SessionCreateParams.Mode.PAYMENT);
        assertThat(params.getClientReferenceId()).isEqualTo(txId.toString());
        assertThat(params.getMetadata()).containsEntry("transactionId", txId.toString());
        assertThat(params.getLineItems()).hasSize(1);

        SessionCreateParams.LineItem lineItem = params.getLineItems().get(0);
        assertThat(lineItem.getQuantity()).isEqualTo(1L);
        assertThat(lineItem.getPriceData().getCurrency()).isEqualTo("mxn");
        // 19.9940 * 100 = 1999.40 → HALF_UP → 1999 cents
        assertThat(lineItem.getPriceData().getUnitAmount()).isEqualTo(1999L);
    }

    @Test
    void createCheckoutSession_rejectsCompletedTransactions() {
        UUID txId = UUID.randomUUID();
        Transaction transaction = openTransaction(txId, new BigDecimal("10.0000"));
        transaction.setStatus(TransactionStatus.COMPLETED);
        when(transactionRepository.findById(txId)).thenReturn(Optional.of(transaction));

        assertThatThrownBy(() -> service.createCheckoutSession(txId))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("IN_PROGRESS or HELD");
    }

    @Test
    void handleWebhook_completesInProgressTransaction() throws Exception {
        UUID txId = UUID.randomUUID();
        Transaction transaction = openTransaction(txId, new BigDecimal("25.5000"));
        when(transactionRepository.findById(txId)).thenReturn(Optional.of(transaction));

        Session session = new Session();
        Map<String, String> metadata = new HashMap<>();
        metadata.put("transactionId", txId.toString());
        session.setMetadata(metadata);
        session.setClientReferenceId(txId.toString());

        Event event = mockCheckoutCompletedEvent(session);
        when(stripeCheckoutClient.constructEvent("payload", "sig")).thenReturn(event);

        String type = service.handleWebhook("payload", "sig");

        assertThat(type).isEqualTo("checkout.session.completed");
        assertThat(transaction.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(transaction.getAmountReceived()).isEqualByComparingTo("25.5000");
        assertThat(transaction.getChangeGiven()).isEqualByComparingTo("0.0000");
    }

    @Test
    void handleWebhook_rejectsInvalidSignature() throws Exception {
        when(stripeCheckoutClient.constructEvent("payload", "bad"))
                .thenThrow(SignatureVerificationException.class);

        assertThatThrownBy(() -> service.handleWebhook("payload", "bad"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Invalid Stripe webhook signature");
    }

    private static Transaction openTransaction(UUID id, BigDecimal grandTotal) {
        Transaction transaction = new Transaction();
        transaction.setId(id);
        transaction.setStatus(TransactionStatus.IN_PROGRESS);
        transaction.setSubtotal(grandTotal);
        transaction.setTaxTotal(BigDecimal.ZERO.setScale(4));
        transaction.setGrandTotal(grandTotal);
        transaction.setAmountReceived(BigDecimal.ZERO.setScale(4));
        transaction.setChangeGiven(BigDecimal.ZERO.setScale(4));
        return transaction;
    }

    private static Event mockCheckoutCompletedEvent(Session session) {
        Event event = mock(Event.class);
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(event.getType()).thenReturn(StripePaymentServiceImpl.EVENT_CHECKOUT_SESSION_COMPLETED);
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        when(deserializer.getObject()).thenReturn(Optional.of(session));
        return event;
    }
}
