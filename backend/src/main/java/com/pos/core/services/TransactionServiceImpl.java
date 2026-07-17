package com.pos.core.services;

import com.pos.core.dtos.PaymentRequestDTO;
import com.pos.core.dtos.PaymentResponseDTO;
import com.pos.core.dtos.TransactionItemRequestDTO;
import com.pos.core.dtos.TransactionItemResponseDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.PaymentType;
import com.pos.core.models.Product;
import com.pos.core.models.Shift;
import com.pos.core.models.ShiftStatus;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.models.TransactionItem;
import com.pos.core.models.TransactionPayment;
import com.pos.core.models.TransactionStatus;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.ShiftRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
import com.pos.customers.models.Customer;
import com.pos.customers.repositories.CustomerRepository;
import com.pos.customers.services.CustomerCreditService;
import com.pos.inventory.services.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class TransactionServiceImpl implements TransactionService {

    public static final String FEATURE_ENABLE_INVENTORY = "enable_inventory";
    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;

    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final StoreSettingsRepository storeSettingsRepository;
    private final ShiftRepository shiftRepository;
    private final InventoryService inventoryService;
    private final CustomerRepository customerRepository;
    private final CustomerCreditService customerCreditService;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            ProductRepository productRepository,
            StoreSettingsRepository storeSettingsRepository,
            ShiftRepository shiftRepository,
            InventoryService inventoryService,
            CustomerRepository customerRepository,
            CustomerCreditService customerCreditService
    ) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.shiftRepository = shiftRepository;
        this.inventoryService = inventoryService;
        this.customerRepository = customerRepository;
        this.customerCreditService = customerCreditService;
    }

    @Override
    public TransactionResponseDTO create(TransactionRequestDTO request) {
        BigDecimal taxRate = request.taxRate() != null
                ? request.taxRate()
                : BigDecimal.ZERO;

        if (taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("taxRate cannot be negative");
        }

        List<PaymentRequestDTO> payments = request.payments();
        if (payments == null || payments.isEmpty()) {
            throw new BusinessRuleException("At least one payment is required");
        }
        for (PaymentRequestDTO payment : payments) {
            if (payment.paymentMethod() == null) {
                throw new BusinessRuleException("Every payment must declare a paymentMethod");
            }
            if (payment.amount() == null || payment.amount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessRuleException("Every payment amount must be greater than zero");
            }
        }

        boolean hasCreditPayment = payments.stream()
                .anyMatch(payment -> payment.paymentMethod() == PaymentType.CREDIT);

        Transaction transaction = new Transaction();
        transaction.setStatus(TransactionStatus.COMPLETED);

        StoreSettings store = null;
        if (request.storeId() != null) {
            store = storeSettingsRepository.findById(request.storeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.storeId()));
            transaction.setStore(store);
            Shift shift = shiftRepository.findFirstByStoreIdAndStatus(store.getId(), ShiftStatus.OPEN)
                    .orElseThrow(() -> new BusinessRuleException("Store does not have an OPEN shift"));
            transaction.setShift(shift);
        }

        Customer customer = null;
        if (hasCreditPayment && request.customerId() == null) {
            throw new BusinessRuleException("customerId is required when a CREDIT payment is present");
        }
        if (request.customerId() != null) {
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found: " + request.customerId()));
            transaction.setCustomer(customer);
        }

        BigDecimal subtotal = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);

        for (TransactionItemRequestDTO itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.productId()));

            BigDecimal quantity = scaleQuantity(itemRequest.quantity());
            // Never trust client prices — snapshot catalog price at sale time.
            BigDecimal priceAtTime = scaleMoney(product.getSellingPrice());
            BigDecimal lineTotal = quantity.multiply(priceAtTime).setScale(MONEY_SCALE, MONEY_ROUNDING);

            TransactionItem item = new TransactionItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPriceAtTime(priceAtTime);
            item.setLineTotal(lineTotal);
            transaction.addItem(item);

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal taxTotal = subtotal.multiply(taxRate).setScale(MONEY_SCALE, MONEY_ROUNDING);
        BigDecimal grandTotal = subtotal.add(taxTotal).setScale(MONEY_SCALE, MONEY_ROUNDING);

        BigDecimal totalPayments = payments.stream()
                .map(payment -> scaleMoney(payment.amount()))
                .reduce(BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING), BigDecimal::add);

        BigDecimal nonCashTotal = payments.stream()
                .filter(payment -> payment.paymentMethod() != PaymentType.CASH)
                .map(payment -> scaleMoney(payment.amount()))
                .reduce(BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING), BigDecimal::add);

        if (totalPayments.compareTo(grandTotal) < 0) {
            throw new BusinessRuleException(
                    "Sum of payments (" + totalPayments + ") is less than grandTotal (" + grandTotal + ")");
        }
        // Change can only be given against cash; CARD/CREDIT must never overpay.
        if (nonCashTotal.compareTo(grandTotal) > 0) {
            throw new BusinessRuleException(
                    "Non-cash payments (" + nonCashTotal + ") cannot exceed grandTotal (" + grandTotal + ")");
        }

        BigDecimal changeGiven = totalPayments.subtract(grandTotal).setScale(MONEY_SCALE, MONEY_ROUNDING);

        for (PaymentRequestDTO paymentRequest : payments) {
            TransactionPayment payment = new TransactionPayment();
            payment.setPaymentMethod(paymentRequest.paymentMethod());
            payment.setAmount(scaleMoney(paymentRequest.amount()));
            transaction.addPayment(payment);
        }

        transaction.setSubtotal(subtotal);
        transaction.setTaxTotal(taxTotal);
        transaction.setGrandTotal(grandTotal);
        transaction.setAmountReceived(totalPayments);
        transaction.setChangeGiven(changeGiven);

        Transaction saved = transactionRepository.save(transaction);

        // Charge only the portion routed to CREDIT — never the full grand total.
        for (TransactionPayment payment : saved.getPayments()) {
            if (payment.getPaymentMethod() == PaymentType.CREDIT) {
                customerCreditService.chargeAccount(saved.getCustomer().getId(), payment.getAmount(), saved);
            }
        }

        // Opt-in inventory: only run when the store flag is explicitly enabled.
        if (isInventoryEnabled(store)) {
            inventoryService.deductStock(saved.getItems());
        }

        return toDto(saved);
    }

    static boolean isInventoryEnabled(StoreSettings store) {
        if (store == null || store.getFeatures() == null) {
            return false;
        }
        Map<String, Boolean> features = store.getFeatures();
        return Boolean.TRUE.equals(features.get(FEATURE_ENABLE_INVENTORY));
    }

    private TransactionResponseDTO toDto(Transaction transaction) {
        List<TransactionItemResponseDTO> items = new ArrayList<>();
        for (TransactionItem item : transaction.getItems()) {
            UUID productId = item.getProduct() != null ? item.getProduct().getId() : null;
            items.add(new TransactionItemResponseDTO(
                    item.getId(),
                    productId,
                    item.getQuantity(),
                    item.getPriceAtTime(),
                    item.getLineTotal()
            ));
        }

        List<PaymentResponseDTO> payments = new ArrayList<>();
        for (TransactionPayment payment : transaction.getPayments()) {
            payments.add(new PaymentResponseDTO(
                    payment.getId(),
                    payment.getPaymentMethod(),
                    payment.getAmount()
            ));
        }

        UUID storeId = transaction.getStore() != null ? transaction.getStore().getId() : null;
        UUID shiftId = transaction.getShift() != null ? transaction.getShift().getId() : null;
        UUID customerId = transaction.getCustomer() != null ? transaction.getCustomer().getId() : null;

        return new TransactionResponseDTO(
                transaction.getId(),
                storeId,
                shiftId,
                customerId,
                transaction.getStatus(),
                transaction.getSubtotal(),
                transaction.getTaxTotal(),
                transaction.getGrandTotal(),
                transaction.getAmountReceived(),
                transaction.getChangeGiven(),
                payments,
                items,
                transaction.getCreatedAt()
        );
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    private static BigDecimal scaleQuantity(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
