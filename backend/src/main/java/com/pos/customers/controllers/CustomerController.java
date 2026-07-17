package com.pos.customers.controllers;

import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CreditLedgerEntryDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.services.CustomerCreditService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {

    private final CustomerCreditService customerCreditService;

    public CustomerController(CustomerCreditService customerCreditService) {
        this.customerCreditService = customerCreditService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerDTO createCustomer(@Valid @RequestBody CreateCustomerRequestDTO request) {
        return customerCreditService.createCustomer(request);
    }

    @GetMapping("/{id}/ledger")
    public List<CreditLedgerEntryDTO> getLedger(@PathVariable UUID id) {
        return customerCreditService.getLedger(id);
    }

    @PostMapping("/{id}/payments")
    public CustomerDTO payBalance(
            @PathVariable UUID id,
            @Valid @RequestBody CustomerPaymentRequestDTO request
    ) {
        return customerCreditService.payBalance(id, request);
    }
}
