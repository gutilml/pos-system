package com.pos.customers.services;

import com.pos.core.models.Transaction;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CreditLedgerEntryDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.dtos.UpdateCustomerRequestDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface CustomerCreditService {

    CustomerDTO createCustomer(CreateCustomerRequestDTO request);

    CustomerDTO getCustomer(UUID id);

    CustomerDTO updateCustomer(UUID id, UpdateCustomerRequestDTO request);

    void deleteCustomer(UUID id);

    List<CustomerDTO> searchCustomers(UUID storeId, String query);

    List<CreditLedgerEntryDTO> getLedger(UUID customerId);

    CustomerDTO payBalance(UUID customerId, CustomerPaymentRequestDTO request);

    /**
     * Charges {@code amount} to the customer's tab (increases balance) and writes a CHARGE ledger entry.
     */
    void chargeAccount(UUID customerId, BigDecimal amount, Transaction transaction);
}
