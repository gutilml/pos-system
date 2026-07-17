package com.pos.core.controllers;

import com.pos.core.dtos.TransactionItemResponseDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.models.PaymentType;
import com.pos.core.models.TransactionStatus;
import com.pos.core.services.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
@Import(GlobalExceptionHandler.class)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;

    @Test
    void createTransaction_returns201() throws Exception {
        UUID txId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID productId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID itemId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        when(transactionService.create(any(TransactionRequestDTO.class))).thenReturn(
                new TransactionResponseDTO(
                        txId,
                        null,
                        null,
                        null,
                        PaymentType.CASH,
                        TransactionStatus.COMPLETED,
                        new BigDecimal("1.9900"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("1.9900"),
                        new BigDecimal("5.0000"),
                        new BigDecimal("3.0100"),
                        List.of(new TransactionItemResponseDTO(
                                itemId,
                                productId,
                                new BigDecimal("1.0000"),
                                new BigDecimal("1.9900"),
                                new BigDecimal("1.9900")
                        )),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        );

        String body = """
                {
                  "items": [
                    { "productId": "11111111-1111-1111-1111-111111111111", "quantity": 1.0000 }
                  ],
                  "amountReceived": 5.0000
                }
                """;

        mockMvc.perform(post("/api/v1/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(txId.toString()))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.paymentType").value("CASH"))
                .andExpect(jsonPath("$.grandTotal").value(1.9900))
                .andExpect(jsonPath("$.items[0].productId").value(productId.toString()));
    }
}
