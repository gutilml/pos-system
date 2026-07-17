package com.pos.core.services;

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

        PaymentType paymentType = request.paymentType() != null
                ? request.paymentType()
                : PaymentType.CASH;

        Transaction transaction = new Transaction();
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setPaymentType(paymentType);

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
        if (paymentType == PaymentType.CREDIT) {
            if (request.customerId() == null) {
                throw new BusinessRuleException("customerId is required for CREDIT payment type");
            }
            customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found: " + request.customerId()));
            transaction.setCustomer(customer);
        } else if (request.customerId() != null) {
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
        BigDecimal amountReceived = scaleMoney(request.amountReceived());
        BigDecimal changeGiven;

        if (paymentType == PaymentType.CREDIT) {
            // Tab charge: no cash collected at register.
            changeGiven = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        } else {
            if (amountReceived.compareTo(grandTotal) < 0) {
                throw new BusinessRuleException("amountReceived is less than grandTotal");
            }
            changeGiven = amountReceived.subtract(grandTotal).setScale(MONEY_SCALE, MONEY_ROUNDING);
        }

        transaction.setSubtotal(subtotal);
        transaction.setTaxTotal(taxTotal);
        transaction.setGrandTotal(grandTotal);
        transaction.setAmountReceived(amountReceived);
        transaction.setChangeGiven(changeGiven);

        Transaction saved = transactionRepository.save(transaction);

        if (paymentType == PaymentType.CREDIT) {
            customerCreditService.chargeAccount(saved.getCustomer().getId(), grandTotal, saved);
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

        UUID storeId = transaction.getStore() != null ? transaction.getStore().getId() : null;
        UUID shiftId = transaction.getShift() != null ? transaction.getShift().getId() : null;
        UUID customerId = transaction.getCustomer() != null ? transaction.getCustomer().getId() : null;
        PaymentType paymentType = transaction.getPaymentType() != null
                ? transaction.getPaymentType()
                : PaymentType.CASH;

        return new TransactionResponseDTO(
                transaction.getId(),
                storeId,
                shiftId,
                customerId,
                paymentType,
                transaction.getStatus(),
                transaction.getSubtotal(),
                transaction.getTaxTotal(),
                transaction.getGrandTotal(),
                transaction.getAmountReceived(),
                transaction.getChangeGiven(),
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
