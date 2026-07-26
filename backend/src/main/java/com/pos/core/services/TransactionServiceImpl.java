package com.pos.core.services;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.PaymentRequestDTO;
import com.pos.core.dtos.PaymentResponseDTO;
import com.pos.core.dtos.ReimburseLineRequestDTO;
import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionItemRequestDTO;
import com.pos.core.dtos.TransactionItemResponseDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEventType;
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
import com.pos.core.services.shift.ShiftService;
import com.pos.customers.models.Customer;
import com.pos.customers.repositories.CustomerRepository;
import com.pos.customers.services.CustomerCreditService;
import com.pos.inventory.services.InventoryService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
    private final ShiftService shiftService;
    private final UserRepository userRepository;

    public TransactionServiceImpl(
            TransactionRepository transactionRepository,
            ProductRepository productRepository,
            StoreSettingsRepository storeSettingsRepository,
            ShiftRepository shiftRepository,
            InventoryService inventoryService,
            CustomerRepository customerRepository,
            CustomerCreditService customerCreditService,
            ShiftService shiftService,
            UserRepository userRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.shiftRepository = shiftRepository;
        this.inventoryService = inventoryService;
        this.customerRepository = customerRepository;
        this.customerCreditService = customerCreditService;
        this.shiftService = shiftService;
        this.userRepository = userRepository;
    }

    @Override
    public TransactionResponseDTO create(TransactionRequestDTO request) {
        BigDecimal taxRate = request.taxRate() != null
                ? request.taxRate()
                : BigDecimal.ZERO;

        if (taxRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("taxRate cannot be negative");
        }

        BigDecimal globalDiscountPercentage = DiscountPricing.normalizePercentage(
                request.globalDiscountPercentage()
        );
        validateDiscountPercentage(globalDiscountPercentage, "globalDiscountPercentage");

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
        transaction.setGlobalDiscountPercentage(globalDiscountPercentage);
        currentUser().ifPresent(user -> transaction.setCreatedBy(user.getId()));

        StoreSettings store = null;
        if (request.storeId() != null) {
            store = storeSettingsRepository.findById(request.storeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.storeId()));
            transaction.setStore(store);
            Shift shift = shiftRepository.findFirstByStoreIdAndStatus(store.getId(), ShiftStatus.OPEN)
                    .orElseThrow(() -> new BusinessRuleException("Store does not have an OPEN shift"));
            transaction.setShift(shift);
        }

        if (hasCreditPayment && request.customerId() == null) {
            throw new BusinessRuleException("customerId is required when a CREDIT payment is present");
        }
        if (request.customerId() != null) {
            Customer customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found: " + request.customerId()));
            transaction.setCustomer(customer);
        }

        BigDecimal subtotal = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        BigDecimal totalDiscountAmount = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);

        for (TransactionItemRequestDTO itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemRequest.productId()));

            BigDecimal quantity = scaleQuantity(itemRequest.quantity());
            BigDecimal itemDiscountPercentage = DiscountPricing.normalizePercentage(
                    itemRequest.itemDiscountPercentage()
            );
            validateDiscountPercentage(itemDiscountPercentage, "itemDiscountPercentage");

            // Never trust client prices — snapshot catalog price at sale time.
            BigDecimal originalUnitPrice = scaleMoney(product.getSellingPrice());
            boolean excludeFromGlobal = Boolean.TRUE.equals(product.getExcludeFromGlobalDiscounts());

            DiscountPricing.PricedLine priced = DiscountPricing.priceLine(
                    originalUnitPrice,
                    quantity,
                    itemDiscountPercentage,
                    globalDiscountPercentage,
                    excludeFromGlobal
            );

            TransactionItem item = new TransactionItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setOriginalUnitPrice(priced.originalUnitPrice());
            item.setItemDiscountPercentage(priced.itemDiscountPercentage());
            item.setFinalUnitPrice(priced.finalUnitPrice());
            item.setPriceAtTime(priced.finalUnitPrice());
            item.setLineTotal(priced.lineTotal());
            item.setReturnedQuantity(BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING));
            transaction.addItem(item);

            subtotal = subtotal.add(priced.lineTotal());
            totalDiscountAmount = totalDiscountAmount.add(priced.lineDiscountAmount());
        }

        subtotal = subtotal.setScale(MONEY_SCALE, MONEY_ROUNDING);
        totalDiscountAmount = totalDiscountAmount.setScale(MONEY_SCALE, MONEY_ROUNDING);

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
        transaction.setTotalDiscountAmount(totalDiscountAmount);
        transaction.setAmountReceived(totalPayments);
        transaction.setChangeGiven(changeGiven);

        Transaction saved = transactionRepository.save(transaction);

        for (TransactionPayment payment : saved.getPayments()) {
            if (payment.getPaymentMethod() == PaymentType.CREDIT) {
                customerCreditService.chargeAccount(saved.getCustomer().getId(), payment.getAmount(), saved);
            }
        }

        if (isInventoryEnabled(store)) {
            inventoryService.deductStock(saved.getItems());
        }

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponseDTO> list(UUID storeId) {
        storeSettingsRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));

        Optional<User> caller = currentUser();
        List<Transaction> transactions;
        if (caller.isPresent() && caller.get().getRole() == Role.CASHIER) {
            // Own tickets only; legacy null created_by never matches (ADMIN-only).
            transactions = transactionRepository.findByStoreIdAndStatusAndCreatedByOrderByCreatedAtDesc(
                    storeId,
                    TransactionStatus.COMPLETED,
                    caller.get().getId()
            );
        } else {
            transactions = transactionRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                    storeId,
                    TransactionStatus.COMPLETED
            );
        }

        return transactions.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponseDTO get(UUID id) {
        Transaction transaction = requireTransaction(id);
        assertCanAccessTicket(transaction, "view");
        return toDto(transaction);
    }

    @Override
    public TransactionResponseDTO reimburse(UUID id, ReimburseRequestDTO request) {
        Transaction transaction = requireTransaction(id);
        assertCanAccessTicket(transaction, "reimburse");

        if (transaction.getStatus() != TransactionStatus.COMPLETED) {
            throw new BusinessRuleException("Only COMPLETED transactions can be reimbursed");
        }

        boolean hasCard = transaction.getPayments().stream()
                .anyMatch(payment -> payment.getPaymentMethod() == PaymentType.CARD);
        if (hasCard) {
            throw new BusinessRuleException("Cannot reimburse a transaction that includes a CARD payment");
        }

        Map<UUID, BigDecimal> returnQtyByItemId = resolveReturnQuantities(transaction, request);

        if (returnQtyByItemId.isEmpty()) {
            throw new BusinessRuleException("No returnable quantity remaining on this transaction");
        }

        BigDecimal refundAmount = computeRefundAmount(transaction, returnQtyByItemId);
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Refund amount must be greater than zero");
        }

        BigDecimal rPrior = computeRefundAmount(transaction, priorReturnedQuantities(transaction));
        TenderSplit split = allocateRefund(transaction, refundAmount, rPrior);

        if (split.cashPortion().compareTo(BigDecimal.ZERO) > 0) {
            if (transaction.getStore() == null) {
                throw new BusinessRuleException("Cannot reimburse CASH without a store on the transaction");
            }
            var openShift = shiftService.getCurrentOpenShift(transaction.getStore().getId());
            shiftService.addDrawerEvent(
                    openShift.id(),
                    new CashDrawerEventRequestDTO(
                            CashDrawerEventType.PAY_OUT,
                            split.cashPortion(),
                            "Ticket reimburse: " + transaction.getId()
                    )
            );
        }

        if (split.creditPortion().compareTo(BigDecimal.ZERO) > 0) {
            if (transaction.getCustomer() == null) {
                throw new BusinessRuleException("Cannot reimburse CREDIT without a customer on the transaction");
            }
            customerCreditService.refundAccount(
                    transaction.getCustomer().getId(),
                    split.creditPortion(),
                    transaction
            );
        }

        List<TransactionItem> restoreItems = new ArrayList<>();
        for (TransactionItem item : transaction.getItems()) {
            BigDecimal returnQty = returnQtyByItemId.get(item.getId());
            if (returnQty == null) {
                continue;
            }
            BigDecimal currentReturned = returnedOrZero(item);
            item.setReturnedQuantity(currentReturned.add(returnQty).setScale(MONEY_SCALE, MONEY_ROUNDING));

            TransactionItem restoreLine = new TransactionItem();
            restoreLine.setProduct(item.getProduct());
            restoreLine.setQuantity(returnQty);
            restoreLine.setTransaction(transaction);
            restoreItems.add(restoreLine);
        }

        if (isInventoryEnabled(transaction.getStore())) {
            inventoryService.restoreStock(restoreItems);
        }

        Transaction saved = transactionRepository.save(transaction);
        return toDto(saved);
    }

    /**
     * Merchandise refund for a line = lineTotal × (returnQty / quantity), scale 4 HALF_UP.
     * Ticket refund R = merchRefundSum × (1 + effectiveTaxRate), where
     * effectiveTaxRate = taxTotal/subtotal if subtotal &gt; 0 else 0.
     */
    static BigDecimal computeRefundAmount(Transaction transaction, Map<UUID, BigDecimal> returnQtyByItemId) {
        BigDecimal merchRefundSum = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        for (TransactionItem item : transaction.getItems()) {
            BigDecimal returnQty = returnQtyByItemId.get(item.getId());
            if (returnQty == null || returnQty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            merchRefundSum = merchRefundSum.add(lineMerchRefund(item, returnQty));
        }
        merchRefundSum = merchRefundSum.setScale(MONEY_SCALE, MONEY_ROUNDING);

        BigDecimal subtotal = scaleMoney(transaction.getSubtotal());
        BigDecimal taxTotal = scaleMoney(transaction.getTaxTotal() != null
                ? transaction.getTaxTotal()
                : BigDecimal.ZERO);
        BigDecimal effectiveTaxRate = subtotal.compareTo(BigDecimal.ZERO) > 0
                ? taxTotal.divide(subtotal, MONEY_SCALE, MONEY_ROUNDING)
                : BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);

        return merchRefundSum
                .multiply(BigDecimal.ONE.add(effectiveTaxRate))
                .setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    static BigDecimal lineMerchRefund(TransactionItem item, BigDecimal returnQty) {
        BigDecimal quantity = scaleQuantity(item.getQuantity());
        if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        return scaleMoney(item.getLineTotal())
                .multiply(returnQty)
                .divide(quantity, MONEY_SCALE, MONEY_ROUNDING);
    }

    /**
     * CASH-first allocation across partial reimbursements (no extra columns):
     * cashNet = Σ CASH − changeGiven; cashAlready = min(R_prior, cashNet);
     * cashPortion = min(R, cashNet − cashAlready); creditPortion = R − cashPortion.
     */
    static TenderSplit allocateRefund(Transaction transaction, BigDecimal refundAmount, BigDecimal rPrior) {
        BigDecimal cashNet = cashNet(transaction);
        BigDecimal cashAlready = rPrior.min(cashNet).setScale(MONEY_SCALE, MONEY_ROUNDING);
        BigDecimal cashRemaining = cashNet.subtract(cashAlready).setScale(MONEY_SCALE, MONEY_ROUNDING);
        if (cashRemaining.compareTo(BigDecimal.ZERO) < 0) {
            cashRemaining = BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        BigDecimal cashPortion = refundAmount.min(cashRemaining).setScale(MONEY_SCALE, MONEY_ROUNDING);
        BigDecimal creditPortion = refundAmount.subtract(cashPortion).setScale(MONEY_SCALE, MONEY_ROUNDING);
        return new TenderSplit(cashPortion, creditPortion);
    }

    static BigDecimal cashNet(Transaction transaction) {
        BigDecimal cashSum = transaction.getPayments().stream()
                .filter(payment -> payment.getPaymentMethod() == PaymentType.CASH)
                .map(payment -> scaleMoney(payment.getAmount()))
                .reduce(BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING), BigDecimal::add);
        BigDecimal change = scaleMoney(transaction.getChangeGiven() != null
                ? transaction.getChangeGiven()
                : BigDecimal.ZERO);
        return cashSum.subtract(change).setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    private Map<UUID, BigDecimal> resolveReturnQuantities(Transaction transaction, ReimburseRequestDTO request) {
        Map<UUID, TransactionItem> itemsById = new HashMap<>();
        for (TransactionItem item : transaction.getItems()) {
            itemsById.put(item.getId(), item);
        }

        List<ReimburseLineRequestDTO> lines = request != null ? request.lines() : null;
        if (lines == null || lines.isEmpty()) {
            Map<UUID, BigDecimal> allRemaining = new LinkedHashMap<>();
            for (TransactionItem item : transaction.getItems()) {
                BigDecimal returnable = returnableQuantity(item);
                if (returnable.compareTo(BigDecimal.ZERO) > 0) {
                    allRemaining.put(item.getId(), returnable);
                }
            }
            return allRemaining;
        }

        Set<UUID> seen = new HashSet<>();
        Map<UUID, BigDecimal> selected = new LinkedHashMap<>();
        for (ReimburseLineRequestDTO line : lines) {
            if (!seen.add(line.transactionItemId())) {
                throw new BusinessRuleException(
                        "Duplicate transactionItemId in reimburse request: " + line.transactionItemId());
            }
            TransactionItem item = itemsById.get(line.transactionItemId());
            if (item == null) {
                throw new ResourceNotFoundException(
                        "Transaction item not found on ticket: " + line.transactionItemId());
            }
            BigDecimal qty = scaleQuantity(line.quantity());
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessRuleException("Return quantity must be greater than zero");
            }
            BigDecimal returnable = returnableQuantity(item);
            if (qty.compareTo(returnable) > 0) {
                throw new BusinessRuleException(
                        "Return quantity " + qty + " exceeds returnable " + returnable
                                + " for item " + item.getId());
            }
            selected.put(item.getId(), qty);
        }
        return selected;
    }

    private static Map<UUID, BigDecimal> priorReturnedQuantities(Transaction transaction) {
        Map<UUID, BigDecimal> prior = new LinkedHashMap<>();
        for (TransactionItem item : transaction.getItems()) {
            BigDecimal returned = returnedOrZero(item);
            if (returned.compareTo(BigDecimal.ZERO) > 0) {
                prior.put(item.getId(), returned);
            }
        }
        return prior;
    }

    private static BigDecimal returnableQuantity(TransactionItem item) {
        return scaleQuantity(item.getQuantity()).subtract(returnedOrZero(item))
                .setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    private static BigDecimal returnedOrZero(TransactionItem item) {
        if (item.getReturnedQuantity() == null) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        return scaleQuantity(item.getReturnedQuantity());
    }

    private Transaction requireTransaction(UUID id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
    }

    /**
     * Feature 086: cashiers may only access tickets they created; null ownership is ADMIN-only.
     * When SecurityContext is empty (unit tests), access is unrestricted.
     */
    private void assertCanAccessTicket(Transaction transaction, String action) {
        Optional<User> caller = currentUser();
        if (caller.isEmpty() || caller.get().getRole() == Role.ADMIN) {
            return;
        }
        if (caller.get().getRole() != Role.CASHIER) {
            return;
        }
        UUID ownerId = transaction.getCreatedBy();
        if (ownerId == null || !ownerId.equals(caller.get().getId())) {
            throw new AccessDeniedException(
                    "You can only " + action + " your own tickets");
        }
    }

    /** Resolves the authenticated user when present; empty when SecurityContext has no PosUserDetails. */
    private Optional<User> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof PosUserDetails details)) {
            return Optional.empty();
        }
        return userRepository.findByUsernameIgnoreCase(details.getUsername())
                .filter(User::isActive);
    }

    static void validateDiscountPercentage(BigDecimal percentage, String fieldName) {
        if (percentage.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException(fieldName + " cannot be negative");
        }
        if (percentage.compareTo(BigDecimal.ONE) > 0) {
            throw new BusinessRuleException(fieldName + " cannot exceed 1.0000 (100%)");
        }
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
            BigDecimal returned = returnedOrZero(item);
            items.add(new TransactionItemResponseDTO(
                    item.getId(),
                    productId,
                    item.getQuantity(),
                    item.getPriceAtTime(),
                    item.getOriginalUnitPrice(),
                    item.getItemDiscountPercentage(),
                    item.getFinalUnitPrice(),
                    item.getLineTotal(),
                    returned,
                    returnableQuantity(item)
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
                transaction.getCreatedBy(),
                transaction.getStatus(),
                transaction.getSubtotal(),
                transaction.getTaxTotal(),
                transaction.getGrandTotal(),
                transaction.getGlobalDiscountPercentage(),
                transaction.getTotalDiscountAmount(),
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

    record TenderSplit(BigDecimal cashPortion, BigDecimal creditPortion) {
    }
}
