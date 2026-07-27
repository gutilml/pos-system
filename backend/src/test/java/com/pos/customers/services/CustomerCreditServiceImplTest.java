package com.pos.customers.services;

import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.PaymentType;
import com.pos.core.models.ShiftStatus;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
import com.pos.core.services.shift.ShiftService;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.dtos.UpdateCustomerRequestDTO;
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

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ShiftService shiftService;

    @InjectMocks
    private CustomerCreditServiceImpl service;

    private StoreSettings store;
    private Customer customer;
    private ShiftDTO openShift;

    @BeforeEach
    void setUp() {
        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        store.setStoreName("Corner Market");
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_customer_credit", true);
        store.setFeatures(features);
        Map<String, Object> preferences = new LinkedHashMap<>();
        preferences.put("ui_locale", "en");
        store.setPreferences(preferences);

        customer = new Customer();
        customer.setId(UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"));
        customer.setStore(store);
        customer.setName("Ana");
        customer.setCreditLimit(new BigDecimal("100.0000"));
        customer.setCurrentBalance(new BigDecimal("40.0000"));

        openShift = new ShiftDTO(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                store.getId(),
                ShiftStatus.OPEN,
                new BigDecimal("100.0000"),
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
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
        assertThat(captor.getValue().getDescription()).isEqualTo("Charge");
        assertThat(captor.getValue().getTransaction()).isEqualTo(tx);
    }

    @Test
    void payBalance_storesSpanishDescriptionWhenStoreLocaleIsEs() {
        store.getPreferences().put("ui_locale", "es");
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        service.payBalance(
                customer.getId(),
                new CustomerPaymentRequestDTO(new BigDecimal("5.0000"), PaymentType.CARD)
        );

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("Pago · Tarjeta");
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
    void payBalance_cashReducesBalanceWritesLedgerAndPayIn() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        CustomerDTO updated = service.payBalance(
                customer.getId(),
                new CustomerPaymentRequestDTO(new BigDecimal("15.5000"), PaymentType.CASH)
        );

        assertThat(updated.currentBalance()).isEqualByComparingTo("24.5000");
        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("24.5000");

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(CreditLedgerEntryType.PAYMENT);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("15.5000");
        assertThat(captor.getValue().getPaymentMethod()).isEqualTo(PaymentType.CASH);
        assertThat(captor.getValue().getDescription()).isEqualTo("Payment · Cash");
        assertThat(captor.getValue().getTransaction()).isNull();

        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        assertThat(eventCaptor.getValue().type()).isEqualTo(CashDrawerEventType.PAY_IN);
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("15.5000");
    }

    @Test
    void payBalance_cardReducesBalanceWithoutPayIn() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        service.payBalance(
                customer.getId(),
                new CustomerPaymentRequestDTO(new BigDecimal("10.0000"), PaymentType.CARD)
        );

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getPaymentMethod()).isEqualTo(PaymentType.CARD);
        verify(shiftService, never()).addDrawerEvent(any(), any());
    }

    @Test
    void payBalance_rejectsCreditMethod() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() ->
                service.payBalance(
                        customer.getId(),
                        new CustomerPaymentRequestDTO(new BigDecimal("5.0000"), PaymentType.CREDIT)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("CASH or CARD");

        verify(ledgerEntryRepository, never()).save(any());
    }

    @Test
    void payBalance_rejectsWhenNoOpenShift() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(shiftService.getCurrentOpenShift(store.getId()))
                .thenThrow(new ResourceNotFoundException("No open shift"));

        assertThatThrownBy(() ->
                service.payBalance(
                        customer.getId(),
                        new CustomerPaymentRequestDTO(new BigDecimal("5.0000"), PaymentType.CASH)))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(ledgerEntryRepository, never()).save(any());
    }

    @Test
    void payBalance_rejectsPaymentGreaterThanBalance() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() ->
                service.payBalance(
                        customer.getId(),
                        new CustomerPaymentRequestDTO(new BigDecimal("40.0001"), PaymentType.CASH)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("exceeds current balance");
    }

    @Test
    void refundAccount_reducesBalanceWritesRefundLedgerLinkedToTransaction() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        Transaction tx = new Transaction();
        tx.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

        service.refundAccount(customer.getId(), new BigDecimal("15.0000"), tx);

        assertThat(customer.getCurrentBalance()).isEqualByComparingTo("25.0000");

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getType()).isEqualTo(CreditLedgerEntryType.REFUND);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("15.0000");
        assertThat(captor.getValue().getDescription()).isEqualTo("Refund");
        assertThat(captor.getValue().getTransaction()).isEqualTo(tx);
        assertThat(captor.getValue().getPaymentMethod()).isNull();
    }

    @Test
    void refundAccount_storesSpanishDescriptionWhenStoreLocaleIsEs() {
        store.getPreferences().put("ui_locale", "es");
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));
        when(ledgerEntryRepository.save(any(CreditLedgerEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        service.refundAccount(customer.getId(), new BigDecimal("5.0000"), new Transaction());

        ArgumentCaptor<CreditLedgerEntry> captor = ArgumentCaptor.forClass(CreditLedgerEntry.class);
        verify(ledgerEntryRepository).save(captor.capture());
        assertThat(captor.getValue().getDescription()).isEqualTo("Reembolso");
    }

    @Test
    void refundAccount_rejectsWhenAmountExceedsBalance() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() ->
                service.refundAccount(customer.getId(), new BigDecimal("40.0001"), new Transaction()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("exceeds current balance");

        verify(ledgerEntryRepository, never()).save(any());
    }

    @Test
    void createCustomer_worksWhenFeatureFlagDisabled() {
        store.getFeatures().put("enable_customer_credit", false);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer saved = inv.getArgument(0);
            saved.setId(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
            return saved;
        });

        CustomerDTO created = service.createCustomer(new CreateCustomerRequestDTO(
                store.getId(),
                "Bob",
                "555-0100",
                new BigDecimal("0.0000")
        ));

        assertThat(created.name()).isEqualTo("Bob");
        assertThat(created.creditLimit()).isEqualByComparingTo("0.0000");
    }

    @Test
    void searchCustomers_listsStoreCustomersForBlankQuery() {
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(customerRepository.findByStoreIdOrderByNameAsc(eq(store.getId()), any(Pageable.class)))
                .thenReturn(List.of(customer));

        List<CustomerDTO> results = service.searchCustomers(store.getId(), "   ");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Ana");
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
    void searchCustomers_worksWhenFeatureFlagDisabled() {
        store.getFeatures().put("enable_customer_credit", false);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(customerRepository.searchByStoreAndQuery(eq(store.getId()), eq("Ana"), any(Pageable.class)))
                .thenReturn(List.of(customer));

        List<CustomerDTO> results = service.searchCustomers(store.getId(), "Ana");

        assertThat(results).hasSize(1);
    }

    @Test
    void updateCustomer_updatesIdentityFields() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerDTO updated = service.updateCustomer(
                customer.getId(),
                new UpdateCustomerRequestDTO("Ana Updated", "555-9999", new BigDecimal("150.0000"))
        );

        assertThat(updated.name()).isEqualTo("Ana Updated");
        assertThat(updated.phone()).isEqualTo("555-9999");
        assertThat(updated.creditLimit()).isEqualByComparingTo("150.0000");
    }

    @Test
    void deleteCustomer_removesWhenBalanceZero() {
        customer.setCurrentBalance(BigDecimal.ZERO.setScale(4));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        service.deleteCustomer(customer.getId());

        verify(ledgerEntryRepository).deleteByCustomerId(customer.getId());
        verify(transactionRepository).clearCustomerReference(customer.getId());
        verify(customerRepository).delete(customer);
    }

    @Test
    void deleteCustomer_rejectsWhenBalanceOutstanding() {
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> service.deleteCustomer(customer.getId()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("outstanding balance");

        verify(customerRepository, never()).delete(any());
    }

    @Test
    void getLedger_rejectsWhenFeatureFlagDisabled() {
        store.getFeatures().put("enable_customer_credit", false);
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> service.getLedger(customer.getId()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not enabled");
    }
}
