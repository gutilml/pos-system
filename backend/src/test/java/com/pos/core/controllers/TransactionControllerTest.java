package com.pos.core.controllers;

import com.pos.core.dtos.PaymentResponseDTO;
import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionItemResponseDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.models.PaymentType;
import com.pos.core.models.TransactionStatus;
import com.pos.core.services.TransactionService;
import com.pos.testsupport.UnsecuredWebMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = TransactionController.class)
@Import(GlobalExceptionHandler.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    private static TransactionResponseDTO sampleTx(UUID txId, UUID productId, UUID itemId, UUID paymentId) {
        return new TransactionResponseDTO(
                txId,
                UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                null,
                null,
                TransactionStatus.COMPLETED,
                new BigDecimal("1.9900"),
                new BigDecimal("0.0000"),
                new BigDecimal("1.9900"),
                new BigDecimal("0.0000"),
                new BigDecimal("0.0000"),
                new BigDecimal("5.0000"),
                new BigDecimal("3.0100"),
                List.of(new PaymentResponseDTO(
                        paymentId,
                        PaymentType.CASH,
                        new BigDecimal("5.0000")
                )),
                List.of(new TransactionItemResponseDTO(
                        itemId,
                        productId,
                        new BigDecimal("1.0000"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("1.0000")
                )),
                OffsetDateTime.parse("2026-07-16T12:00:00Z")
        );
    }

    @Test
    void createTransaction_returns201() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID productId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID itemId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID paymentId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

        when(transactionService.create(any(TransactionRequestDTO.class)))
                .thenReturn(sampleTx(txId, productId, itemId, paymentId));

        String body = """
                {
                  "items": [
                    { "productId": "11111111-1111-1111-1111-111111111111", "quantity": 1.0000 }
                  ],
                  "payments": [
                    { "paymentMethod": "CASH", "amount": 5.0000 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(txId.toString()))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.payments[0].paymentMethod").value("CASH"))
                .andExpect(jsonPath("$.payments[0].amount").value(5.0000))
                .andExpect(jsonPath("$.grandTotal").value(1.9900))
                .andExpect(jsonPath("$.items[0].productId").value(productId.toString()))
                .andExpect(jsonPath("$.items[0].returnedQuantity").value(0.0000))
                .andExpect(jsonPath("$.items[0].returnableQuantity").value(1.0000));
    }

    @Test
    void createTransaction_withoutPayments_returns400() throws Exception {
        String body = """
                {
                  "items": [
                    { "productId": "11111111-1111-1111-1111-111111111111", "quantity": 1.0000 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listTransactions_returns200() throws Exception {
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID productId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID itemId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID paymentId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

        when(transactionService.list(storeId)).thenReturn(List.of(sampleTx(txId, productId, itemId, paymentId)));

        mockMvc.perform(get("/api/v1/transactions").param("storeId", storeId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(txId.toString()))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"));
    }

    @Test
    void getTransaction_returns200() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID productId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID itemId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID paymentId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

        when(transactionService.get(txId)).thenReturn(sampleTx(txId, productId, itemId, paymentId));

        mockMvc.perform(get("/api/v1/transactions/{id}", txId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(txId.toString()))
                .andExpect(jsonPath("$.items[0].returnableQuantity").value(1.0000));
    }

    @Test
    void reimburseTransaction_returns200() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID productId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID itemId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        UUID paymentId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");

        TransactionResponseDTO reimbursed = new TransactionResponseDTO(
                txId,
                UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                null,
                null,
                TransactionStatus.COMPLETED,
                new BigDecimal("1.9900"),
                new BigDecimal("0.0000"),
                new BigDecimal("1.9900"),
                new BigDecimal("0.0000"),
                new BigDecimal("0.0000"),
                new BigDecimal("5.0000"),
                new BigDecimal("3.0100"),
                List.of(new PaymentResponseDTO(paymentId, PaymentType.CASH, new BigDecimal("5.0000"))),
                List.of(new TransactionItemResponseDTO(
                        itemId,
                        productId,
                        new BigDecimal("1.0000"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("1.0000"),
                        new BigDecimal("0.0000")
                )),
                OffsetDateTime.parse("2026-07-16T12:00:00Z")
        );

        when(transactionService.reimburse(eq(txId), any(ReimburseRequestDTO.class))).thenReturn(reimbursed);

        String body = """
                {
                  "lines": [
                    { "transactionItemId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "quantity": 1.0000 }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/transactions/{id}/reimburse", txId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].returnedQuantity").value(1.0000))
                .andExpect(jsonPath("$.items[0].returnableQuantity").value(0.0000));

        verify(transactionService).reimburse(eq(txId), any(ReimburseRequestDTO.class));
    }
}
