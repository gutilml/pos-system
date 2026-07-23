package com.pos.core.controllers;

import com.pos.core.dtos.payments.CheckoutSessionResponseDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.services.payments.StripePaymentService;
import com.pos.testsupport.UnsecuredWebMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = PaymentController.class)
@Import(GlobalExceptionHandler.class)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StripePaymentService stripePaymentService;

    @Test
    void createCheckoutSession_returns201() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        when(stripePaymentService.createCheckoutSession(txId))
                .thenReturn(new CheckoutSessionResponseDTO("cs_test_1", "https://checkout.stripe.com/pay/cs_test_1"));

        mockMvc.perform(post("/api/v1/payments/checkout/{transactionId}", txId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sessionId").value("cs_test_1"))
                .andExpect(jsonPath("$.checkoutUrl").value("https://checkout.stripe.com/pay/cs_test_1"));
    }

    @Test
    void webhook_passesRawPayloadAndSignature() throws Exception {
        when(stripePaymentService.handleWebhook(eq("{\"id\":\"evt_1\"}"), eq("t=1,v1=abc")))
                .thenReturn("checkout.session.completed");

        mockMvc.perform(post("/api/v1/payments/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", "t=1,v1=abc")
                        .content("{\"id\":\"evt_1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received").value("true"))
                .andExpect(jsonPath("$.type").value("checkout.session.completed"));

        verify(stripePaymentService).handleWebhook("{\"id\":\"evt_1\"}", "t=1,v1=abc");
    }

    @Test
    void webhook_invalidSignature_returns400() throws Exception {
        when(stripePaymentService.handleWebhook(eq("{}"), eq("bad")))
                .thenThrow(new BusinessRuleException("Invalid Stripe webhook signature"));

        mockMvc.perform(post("/api/v1/payments/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", "bad")
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
