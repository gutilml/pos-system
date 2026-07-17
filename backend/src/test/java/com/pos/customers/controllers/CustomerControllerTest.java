package com.pos.customers.controllers;

import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CreditLedgerEntryDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.models.CreditLedgerEntryType;
import com.pos.customers.services.CustomerCreditService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CustomerController.class)
@Import(GlobalExceptionHandler.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerCreditService customerCreditService;

    @Test
    void createCustomer_returns201() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");

        when(customerCreditService.createCustomer(any(CreateCustomerRequestDTO.class))).thenReturn(
                new CustomerDTO(
                        customerId,
                        storeId,
                        "Ana",
                        "555-0100",
                        new BigDecimal("100.0000"),
                        new BigDecimal("0.0000"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        );

        String body = """
                {
                  "storeId": "dddddddd-dddd-dddd-dddd-dddddddddddd",
                  "name": "Ana",
                  "phone": "555-0100",
                  "creditLimit": 100.0000
                }
                """;

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(customerId.toString()))
                .andExpect(jsonPath("$.creditLimit").value(100.0000))
                .andExpect(jsonPath("$.currentBalance").value(0.0000));
    }

    @Test
    void getLedger_returnsEntries() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        when(customerCreditService.getLedger(customerId)).thenReturn(List.of(
                new CreditLedgerEntryDTO(
                        UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                        customerId,
                        null,
                        new BigDecimal("25.0000"),
                        CreditLedgerEntryType.PAYMENT,
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        ));

        mockMvc.perform(get("/api/v1/customers/{id}/ledger", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].type").value("PAYMENT"))
                .andExpect(jsonPath("$[0].amount").value(25.0000));
    }

    @Test
    void payBalance_returnsUpdatedCustomer() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");

        when(customerCreditService.payBalance(eq(customerId), any(CustomerPaymentRequestDTO.class)))
                .thenReturn(new CustomerDTO(
                        customerId,
                        storeId,
                        "Ana",
                        "555-0100",
                        new BigDecimal("100.0000"),
                        new BigDecimal("75.0000"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                ));

        mockMvc.perform(post("/api/v1/customers/{id}/payments", customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 25.0000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentBalance").value(75.0000));
    }
}
