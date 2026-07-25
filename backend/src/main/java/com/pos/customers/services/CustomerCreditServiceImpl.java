package com.pos.customers.services;

import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.PaymentType;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
import com.pos.core.services.shift.ShiftService;
import com.pos.customers.dtos.CreateCustomerRequestDTO;
import com.pos.customers.dtos.CreditLedgerEntryDTO;
import com.pos.customers.dtos.CustomerDTO;
import com.pos.customers.dtos.CustomerPaymentRequestDTO;
import com.pos.customers.dtos.UpdateCustomerRequestDTO;
import com.pos.customers.exception.CreditLimitExceededException;
import com.pos.customers.models.CreditLedgerEntry;
import com.pos.customers.models.CreditLedgerEntryType;
import com.pos.customers.models.Customer;
import com.pos.customers.repositories.CreditLedgerEntryRepository;
import com.pos.customers.repositories.CustomerRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class CustomerCreditServiceImpl implements CustomerCreditService {

    public static final String FEATURE_ENABLE_CUSTOMER_CREDIT = "enable_customer_credit";
    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;
    public static final int SEARCH_LIMIT = 20;

    private final CustomerRepository customerRepository;
    private final CreditLedgerEntryRepository ledgerEntryRepository;
    private final StoreSettingsRepository storeSettingsRepository;
    private final TransactionRepository transactionRepository;
    private final ShiftService shiftService;

    public CustomerCreditServiceImpl(
            CustomerRepository customerRepository,
            CreditLedgerEntryRepository ledgerEntryRepository,
            StoreSettingsRepository storeSettingsRepository,
            TransactionRepository transactionRepository,
            ShiftService shiftService
    ) {
        this.customerRepository = customerRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.transactionRepository = transactionRepository;
        this.shiftService = shiftService;
    }

    @Override
    public CustomerDTO createCustomer(CreateCustomerRequestDTO request) {
        StoreSettings store = storeSettingsRepository.findById(request.storeId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.storeId()));

        Customer customer = new Customer();
        customer.setStore(store);
        customer.setName(request.name().trim());
        customer.setPhone(normalizePhone(request.phone()));
        customer.setCreditLimit(scaleMoney(request.creditLimit()));
        customer.setCurrentBalance(BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING));

        return toCustomerDto(customerRepository.save(customer));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomer(UUID id) {
        return toCustomerDto(getCustomerEntity(id));
    }

    @Override
    public CustomerDTO updateCustomer(UUID id, UpdateCustomerRequestDTO request) {
        Customer customer = getCustomerEntity(id);
        customer.setName(request.name().trim());
        customer.setPhone(normalizePhone(request.phone()));
        customer.setCreditLimit(scaleMoney(request.creditLimit()));
        return toCustomerDto(customerRepository.save(customer));
    }

    @Override
    public void deleteCustomer(UUID id) {
        Customer customer = getCustomerEntity(id);
        BigDecimal balance = scaleMoney(customer.getCurrentBalance());
        if (balance.compareTo(BigDecimal.ZERO) != 0) {
            throw new BusinessRuleException(
                    "Cannot delete customer with outstanding balance " + balance);
        }
        ledgerEntryRepository.deleteByCustomerId(id);
        transactionRepository.clearCustomerReference(id);
        customerRepository.delete(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> searchCustomers(UUID storeId, String query) {
        String trimmed = query == null ? "" : query.trim();
        storeSettingsRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));

        PageRequest page = PageRequest.of(0, SEARCH_LIMIT);
        List<Customer> matches = trimmed.isEmpty()
                ? customerRepository.findByStoreIdOrderByNameAsc(storeId, page)
                : customerRepository.searchByStoreAndQuery(storeId, trimmed, page);

        return matches.stream().map(this::toCustomerDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CreditLedgerEntryDTO> getLedger(UUID customerId) {
        Customer customer = getCustomerEntity(customerId);
        requireCustomerCreditEnabled(customer.getStore());

        return ledgerEntryRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(this::toLedgerDto)
                .toList();
    }

    @Override
    public CustomerDTO payBalance(UUID customerId, CustomerPaymentRequestDTO request) {
        Customer customer = getCustomerEntity(customerId);
        requireCustomerCreditEnabled(customer.getStore());

        PaymentType method = request.paymentMethod();
        if (method != PaymentType.CASH && method != PaymentType.CARD) {
            throw new BusinessRuleException("Customer payment method must be CASH or CARD");
        }

        BigDecimal amount = scaleMoney(request.amount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Payment amount must be greater than zero");
        }

        BigDecimal balance = scaleMoney(customer.getCurrentBalance());
        if (amount.compareTo(balance) > 0) {
            throw new BusinessRuleException(
                    "Payment amount " + amount + " exceeds current balance " + balance);
        }

        ShiftDTO openShift = shiftService.getCurrentOpenShift(customer.getStore().getId());

        BigDecimal newBalance = balance.subtract(amount).setScale(MONEY_SCALE, MONEY_ROUNDING);
        customer.setCurrentBalance(newBalance);

        CreditLedgerEntry entry = new CreditLedgerEntry();
        entry.setCustomer(customer);
        entry.setTransaction(null);
        entry.setAmount(amount);
        entry.setType(CreditLedgerEntryType.PAYMENT);
        entry.setPaymentMethod(method);
        ledgerEntryRepository.save(entry);

        if (method == PaymentType.CASH) {
            shiftService.addDrawerEvent(
                    openShift.id(),
                    new CashDrawerEventRequestDTO(
                            CashDrawerEventType.PAY_IN,
                            amount,
                            "Customer credit payment: " + customer.getName()
                    )
            );
        }

        return toCustomerDto(customerRepository.save(customer));
    }

    @Override
    public void chargeAccount(UUID customerId, BigDecimal amount, Transaction transaction) {
        Customer customer = getCustomerEntity(customerId);
        requireCustomerCreditEnabled(customer.getStore());

        BigDecimal chargeAmount = scaleMoney(amount);
        if (chargeAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Charge amount must be greater than zero");
        }

        BigDecimal balance = scaleMoney(customer.getCurrentBalance());
        BigDecimal limit = scaleMoney(customer.getCreditLimit());
        BigDecimal projected = balance.add(chargeAmount).setScale(MONEY_SCALE, MONEY_ROUNDING);

        // Strict: projected balance must not exceed credit limit (equal to limit is allowed).
        if (projected.compareTo(limit) > 0) {
            throw new CreditLimitExceededException(
                    "Charge would exceed credit limit. balance=" + balance
                            + ", charge=" + chargeAmount
                            + ", limit=" + limit
                            + ", projected=" + projected);
        }

        customer.setCurrentBalance(projected);

        CreditLedgerEntry entry = new CreditLedgerEntry();
        entry.setCustomer(customer);
        entry.setTransaction(transaction);
        entry.setAmount(chargeAmount);
        entry.setType(CreditLedgerEntryType.CHARGE);
        ledgerEntryRepository.save(entry);
        customerRepository.save(customer);
    }

    static boolean isCustomerCreditEnabled(StoreSettings store) {
        if (store == null || store.getFeatures() == null) {
            return false;
        }
        Map<String, Boolean> features = store.getFeatures();
        return Boolean.TRUE.equals(features.get(FEATURE_ENABLE_CUSTOMER_CREDIT));
    }

    private void requireCustomerCreditEnabled(StoreSettings store) {
        if (!isCustomerCreditEnabled(store)) {
            throw new BusinessRuleException("Customer credit is not enabled for this store");
        }
    }

    private Customer getCustomerEntity(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    private static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }
        return phone.trim();
    }

    private CustomerDTO toCustomerDto(Customer customer) {
        return new CustomerDTO(
                customer.getId(),
                customer.getStore().getId(),
                customer.getName(),
                customer.getPhone(),
                customer.getCreditLimit(),
                customer.getCurrentBalance(),
                customer.getCreatedAt()
        );
    }

    private CreditLedgerEntryDTO toLedgerDto(CreditLedgerEntry entry) {
        UUID transactionId = entry.getTransaction() != null ? entry.getTransaction().getId() : null;
        return new CreditLedgerEntryDTO(
                entry.getId(),
                entry.getCustomer().getId(),
                transactionId,
                entry.getAmount(),
                entry.getType(),
                entry.getPaymentMethod(),
                entry.getCreatedAt()
        );
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
