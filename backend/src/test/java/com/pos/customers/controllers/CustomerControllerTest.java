package com.pos.customers.controllers;

import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.models.PaymentType;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CreditLedgerEntryDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.dtos.UpdateCustomerRequestDTO;
import com.pos.customers.models.CreditLedgerEntryType;
import com.pos.customers.services.CustomerCreditService;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = CustomerController.class)
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
                        PaymentType.CASH,
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
                        .content("{\"amount\": 25.0000, \"paymentMethod\": \"CASH\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentBalance").value(75.0000));
    }

    @Test
    void searchCustomers_returnsMatches() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");

        when(customerCreditService.searchCustomers(eq(storeId), eq("Ana"))).thenReturn(List.of(
                new CustomerDTO(
                        customerId,
                        storeId,
                        "Ana",
                        "555-0100",
                        new BigDecimal("100.0000"),
                        new BigDecimal("40.0000"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        ));

        mockMvc.perform(get("/api/v1/customers/search")
                        .param("storeId", storeId.toString())
                        .param("q", "Ana"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(customerId.toString()))
                .andExpect(jsonPath("$[0].name").value("Ana"))
                .andExpect(jsonPath("$[0].creditLimit").value(100.0000))
                .andExpect(jsonPath("$[0].currentBalance").value(40.0000));
    }

    @Test
    void searchCustomers_returnsListForBlankQuery() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        when(customerCreditService.searchCustomers(eq(storeId), any())).thenReturn(List.of(
                new CustomerDTO(
                        customerId,
                        storeId,
                        "Ana",
                        null,
                        new BigDecimal("0.0000"),
                        new BigDecimal("0.0000"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        ));

        mockMvc.perform(get("/api/v1/customers/search")
                        .param("storeId", storeId.toString())
                        .param("q", "   "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Ana"));
    }

    @Test
    void getCustomer_returnsDto() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        when(customerCreditService.getCustomer(customerId)).thenReturn(
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

        mockMvc.perform(get("/api/v1/customers/{id}", customerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ana"));
    }

    @Test
    void updateCustomer_returnsUpdatedDto() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        UUID storeId = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        when(customerCreditService.updateCustomer(eq(customerId), any(UpdateCustomerRequestDTO.class)))
                .thenReturn(new CustomerDTO(
                        customerId,
                        storeId,
                        "Ana Updated",
                        "555-9999",
                        new BigDecimal("200.0000"),
                        new BigDecimal("0.0000"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                ));

        mockMvc.perform(put("/api/v1/customers/{id}", customerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Ana Updated","phone":"555-9999","creditLimit":200.0000}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ana Updated"))
                .andExpect(jsonPath("$.creditLimit").value(200.0000));
    }

    @Test
    void deleteCustomer_returns204() throws Exception {
        UUID customerId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        doNothing().when(customerCreditService).deleteCustomer(customerId);

        mockMvc.perform(delete("/api/v1/customers/{id}", customerId))
                .andExpect(status().isNoContent());

        verify(customerCreditService).deleteCustomer(customerId);
    }

    @Test
    void searchCustomers_returns400WhenStoreIdMissing() throws Exception {
        mockMvc.perform(get("/api/v1/customers/search").param("q", "Ana"))
                .andExpect(status().isBadRequest());
    }
}
