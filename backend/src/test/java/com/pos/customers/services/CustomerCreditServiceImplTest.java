package com.pos.customers.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.exception.CreditLimitExceededException;
import com.pos.customers.models.CreditLedgerEntry;
import com.pos.customers.models.CreditLedgerEntryType;
import com.pos.customers.models.Customer;
import com.pos.customers.repositories.CreditLedgerEntryRepository;
import com.pos.customers.repositories.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class CustomerCreditServiceImplTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CreditLedgerEntryRepository ledgerEntryRepository;

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @InjectMocks
    private CustomerCreditServiceImpl service;

    private StoreSettings store;
    private Customer customer;

    @BeforeEach
    void setUp() {
        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        store.setStoreName("Corner Market");
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_customer_credit", true);
        store.setFeatures(features);

        customer = new Customer();
        customer.setId(UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"));
        customer.setStore(store);
        customer.setName("Ana");
        customer.setCreditLimit(new BigDecimal("100.0000"));
        customer.setCurrentBalance(new BigDecimal("40.0000"));
    }

    @Test
    void chargeAccount_allowsChargeUpToExactCreditLimit() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        Transaction tx = new Transaction();
        tx.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

        // 40 + 60 = 100.0000 exactly → allowed
        service.chargeAccount(customer.getId(), new BigDecimal("60.0000"), tx);

        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("100.0000");

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(CreditLedgerEntryType.CHARGE);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("60.0000");
        assertThat(captor.getValue().getTransaction()).isEqualTo(tx);
    }

    @Test
    void chargeAccount_throwsWhenProjectedBalanceExceedsLimit() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        // 40 + 60.0001 = 100.0001 > 100 → blocked
        assertThatThrownBy(() ->
                service.chargeAccount(customer.getId(), new BigDecimal("60.0001"), new Transaction()))
                .isInstanceOf(CreditLimitExceededException.class)
                .hasMessageContaining("exceed credit limit");

        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("40.0000");
        verify(ledgerEntryRepository, never()).save(any());
    }

    @Test
    void chargeAccount_appliesHalfUpScaleOnAmounts() {
        customer.setCurrentBalance(new BigDecimal("10.0000"));
        customer.setCreditLimit(new BigDecimal("20.0000"));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        service.chargeAccount(customer.getId(), new BigDecimal("1.9949"), new Transaction());

        // 1.9949 → scale 4 HALF_UP stays 1.9949; 10 + 1.9949 = 11.9949
        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("11.9949");
    }

    @Test
    void chargeAccount_rejectsWhenFeatureFlagDisabled() {
        store.getFeatures().put("enable_customer_credit", false);
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() ->
                service.chargeAccount(customer.getId(), new BigDecimal("1.0000"), new Transaction()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not enabled");
    }

    @Test
    void payBalance_reducesBalanceAndWritesPaymentLedger() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerDTO updated = service.payBalance(
                customer.getId(),
                new CustomerPaymentRequestDTO(new BigDecimal("15.5000"))
        );

        assertThat(updated.currentBalance()).isEqualByComparingTo("24.5000");
        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("24.5000");

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(CreditLedgerEntryType.PAYMENT);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("15.5000");
        assertThat(captor.getValue().getTransaction()).isNull();
    }

    @Test
    void payBalance_rejectsPaymentGreaterThanBalance() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() ->
                service.payBalance(customer.getId(), new CustomerPaymentRequestDTO(new BigDecimal("40.0001"))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("exceeds current balance");
    }

    @Test
    void createCustomer_requiresFeatureFlag() {
        store.getFeatures().put("enable_customer_credit", false);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));

        assertThatThrownBy(() -> service.createCustomer(new CreateCustomerRequestDTO(
                store.getId(),
                "Bob",
                "555-0100",
                new BigDecimal("50.0000")
        ))).isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not enabled");
    }

    @Test
    void searchCustomers_returnsEmptyListForBlankQueryWithoutHittingRepository() {
        List<CustomerDTO> results = service.searchCustomers(store.getId(), "   ");

        assertThat(results).isEmpty();
        verify(customerRepository, never()).searchByStoreAndQuery(any(), any(), any());
    }

    @Test
    void searchCustomers_mapsMatchesForStore() {
        customer.setPhone("555-0100");
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(customerRepository.searchByStoreAndQuery(eq(store.getId()), eq("ana"), any(Pageable.class)))
                .thenReturn(List.of(customer));

        List<CustomerDTO> results = service.searchCustomers(store.getId(), "ana");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Ana");
        assertThat(results.get(0).phone()).isEqualTo("555-0100");
        assertThat(results.get(0).creditLimit()).isEqualByComparingTo("100.0000");
        assertThat(results.get(0).currentBalance()).isEqualByComparingTo("40.0000");
    }

    @Test
    void searchCustomers_requiresFeatureFlag() {
        store.getFeatures().put("enable_customer_credit", false);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));

        assertThatThrownBy(() -> service.searchCustomers(store.getId(), "Ana"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not enabled");
    }
}
