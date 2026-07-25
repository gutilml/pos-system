package com.pos.core.services;

import com.pos.core.dtos.PaymentRequestDTO;
import com.pos.core.dtos.ReimburseLineRequestDTO;
import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionItemRequestDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.PaymentType;
import com.pos.core.models.Product;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerCreditService customerCreditService;

    @Mock
    private ShiftService shiftService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private Product cola;
    private Product chips;
    private Product specialPrice;
    private Customer customer;
    private StoreSettings store;
    private ShiftDTO openShift;

    @BeforeEach
    void setUp() {
        cola = new Product();
        cola.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        cola.setName("Cola");
        cola.setSellingPrice(new BigDecimal("1.9900"));

        chips = new Product();
        chips.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        chips.setName("Chips");
        chips.setSellingPrice(new BigDecimal("2.5000"));

        specialPrice = new Product();
        specialPrice.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
        specialPrice.setName("Special Price Item");
        specialPrice.setSellingPrice(new BigDecimal("2.5000"));
        specialPrice.setExcludeFromGlobalDiscounts(true);

        customer = new Customer();
        customer.setId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
        customer.setName("Dana Tab");
        customer.setCreditLimit(new BigDecimal("500.0000"));
        customer.setCurrentBalance(BigDecimal.ZERO);

        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        store.setStoreName("Corner Market");

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
                null
        );
    }

    private static TransactionRequestDTO request(
            List<TransactionItemRequestDTO> items,
            List<PaymentRequestDTO> payments,
            BigDecimal taxRate,
            UUID customerId
    ) {
        return request(items, payments, taxRate, customerId, null);
    }

    private static TransactionRequestDTO request(
            List<TransactionItemRequestDTO> items,
            List<PaymentRequestDTO> payments,
            BigDecimal taxRate,
            UUID customerId,
            BigDecimal globalDiscountPercentage
    ) {
        return new TransactionRequestDTO(
                null,
                items,
                payments,
                taxRate,
                customerId,
                globalDiscountPercentage
        );
    }

    private static TransactionItemRequestDTO line(UUID productId, BigDecimal quantity) {
        return new TransactionItemRequestDTO(productId, quantity, null);
    }

    private static TransactionItemRequestDTO line(
            UUID productId,
            BigDecimal quantity,
            BigDecimal itemDiscountPercentage
    ) {
        return new TransactionItemRequestDTO(productId, quantity, itemDiscountPercentage);
    }

    @Test
    void create_recalculatesSubtotalTaxGrandTotalAndChangeWithExactBigDecimalMath() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(productRepository.findById(chips.getId())).thenReturn(Optional.of(chips));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction tx = invocation.getArgument(0);
            tx.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
            return tx;
        });

        TransactionRequestDTO request = request(
                List.of(
                        line(cola.getId(), new BigDecimal("2.0000")),
                        line(chips.getId(), new BigDecimal("1.0000"))
                ),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("10.0000"))),
                new BigDecimal("0.0825"),
                null
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("6.4800");
        assertThat(response.taxTotal()).isEqualByComparingTo("0.5346");
        assertThat(response.grandTotal()).isEqualByComparingTo("7.0146");
        assertThat(response.totalDiscountAmount()).isEqualByComparingTo("0.0000");
        assertThat(response.amountReceived()).isEqualByComparingTo("10.0000");
        assertThat(response.changeGiven()).isEqualByComparingTo("2.9854");
        assertThat(response.payments()).hasSize(1);
        assertThat(response.items()).hasSize(2);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getSubtotal()).isEqualByComparingTo("6.4800");
        verify(inventoryService, never()).deductStock(anyList());
        verify(customerCreditService, never()).chargeAccount(any(), any(), any());
    }

    @Test
    void create_appliesGlobalOnlyToLinesWithoutItemDiscountOrExclusion() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(productRepository.findById(chips.getId())).thenReturn(Optional.of(chips));
        when(productRepository.findById(specialPrice.getId())).thenReturn(Optional.of(specialPrice));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(
                        line(cola.getId(), new BigDecimal("1.0000"), new BigDecimal("0.1000")),
                        line(chips.getId(), new BigDecimal("1.0000")),
                        line(specialPrice.getId(), new BigDecimal("1.0000"))
                ),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("10.0000"))),
                null,
                null,
                new BigDecimal("0.1000")
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.globalDiscountPercentage()).isEqualByComparingTo("0.1000");
        assertThat(response.subtotal()).isEqualByComparingTo("6.5410");
        assertThat(response.totalDiscountAmount()).isEqualByComparingTo("0.4490");

        assertThat(response.items().get(0).finalUnitPrice()).isEqualByComparingTo("1.7910");
        assertThat(response.items().get(1).finalUnitPrice()).isEqualByComparingTo("2.2500");
        assertThat(response.items().get(2).finalUnitPrice()).isEqualByComparingTo("2.5000");
    }

    @Test
    void create_itemDiscountExcludesLineFromGlobalDiscount() {
        Product premium = new Product();
        premium.setId(UUID.fromString("55555555-5555-5555-5555-555555555555"));
        premium.setName("Premium");
        premium.setSellingPrice(new BigDecimal("100.0000"));

        when(productRepository.findById(premium.getId())).thenReturn(Optional.of(premium));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(line(premium.getId(), new BigDecimal("1.0000"), new BigDecimal("0.1000"))),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("90.0000"))),
                null,
                null,
                new BigDecimal("0.1000")
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("90.0000");
        assertThat(response.totalDiscountAmount()).isEqualByComparingTo("10.0000");
        assertThat(response.items().get(0).finalUnitPrice()).isEqualByComparingTo("90.0000");
    }

    @Test
    void create_ignoresClientTotalsAndUsesCatalogPrice() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"))),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("5.0000"))),
                null,
                null
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("1.9900");
        assertThat(response.items().get(0).priceAtTime()).isEqualByComparingTo("1.9900");
        assertThat(response.items().get(0).originalUnitPrice()).isEqualByComparingTo("1.9900");
    }

    @Test
    void create_splitCashAndCredit_chargesOnlyTheCreditPortion() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(productRepository.findById(chips.getId())).thenReturn(Optional.of(chips));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(
                        line(cola.getId(), new BigDecimal("2.0000")),
                        line(chips.getId(), new BigDecimal("1.0000"))
                ),
                List.of(
                        new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("2.4800")),
                        new PaymentRequestDTO(PaymentType.CREDIT, new BigDecimal("4.0000"))
                ),
                null,
                customer.getId()
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.grandTotal()).isEqualByComparingTo("6.4800");
        verify(customerCreditService).chargeAccount(
                eq(customer.getId()),
                eq(new BigDecimal("4.0000")),
                any(Transaction.class)
        );
    }

    @Test
    void create_rejectsWhenSumOfPaymentsIsLessThanGrandTotal() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));

        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("2.0000"))),
                List.of(
                        new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("1.0000")),
                        new PaymentRequestDTO(PaymentType.CARD, new BigDecimal("1.0000"))
                ),
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Sum of payments");

        verify(transactionRepository, never()).save(any(Transaction.class));
    }

    @Test
    void create_rejectsCreditPaymentWithoutCustomerId() {
        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"))),
                List.of(new PaymentRequestDTO(PaymentType.CREDIT, new BigDecimal("1.9900"))),
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("customerId is required");
    }

    @Test
    void create_rejectsNonCashOverpayment() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(customerRepository.findById(customer.getId())).thenReturn(Optional.of(customer));

        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"))),
                List.of(new PaymentRequestDTO(PaymentType.CREDIT, new BigDecimal("5.0000"))),
                null,
                customer.getId()
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Non-cash payments");
    }

    @Test
    void create_rejectsEmptyPayments() {
        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"))),
                List.of(),
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("At least one payment");
    }

    @Test
    void create_rejectsNonPositivePaymentAmount() {
        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"))),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("0.0000"))),
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("greater than zero");
    }

    @Test
    void create_rejectsDiscountPercentageAboveOne() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));

        TransactionRequestDTO request = request(
                List.of(line(cola.getId(), new BigDecimal("1.0000"), new BigDecimal("1.5000"))),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("5.0000"))),
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("itemDiscountPercentage");
    }

    @Test
    void reimburse_cashOnly_fullReturn_payOutAndRestoresReturnedQty() {
        Transaction tx = cashSale(new BigDecimal("2.0000"), new BigDecimal("3.9800"), new BigDecimal("0.0000"));
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        TransactionResponseDTO response = transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null));

        assertThat(response.items().get(0).returnedQuantity()).isEqualByComparingTo("2.0000");
        assertThat(response.items().get(0).returnableQuantity()).isEqualByComparingTo("0.0000");

        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        assertThat(eventCaptor.getValue().type()).isEqualTo(CashDrawerEventType.PAY_OUT);
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("3.9800");
        assertThat(eventCaptor.getValue().reason()).contains(tx.getId().toString());
        verify(customerCreditService, never()).refundAccount(any(), any(), any());
        verify(inventoryService, never()).restoreStock(anyList());
    }

    @Test
    void reimburse_cashOnly_partialReturn() {
        Transaction tx = cashSale(new BigDecimal("2.0000"), new BigDecimal("3.9800"), new BigDecimal("0.0000"));
        UUID itemId = tx.getItems().get(0).getId();
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        TransactionResponseDTO response = transactionService.reimburse(
                tx.getId(),
                new ReimburseRequestDTO(List.of(new ReimburseLineRequestDTO(itemId, new BigDecimal("1.0000"))))
        );

        assertThat(response.items().get(0).returnedQuantity()).isEqualByComparingTo("1.0000");
        assertThat(response.items().get(0).returnableQuantity()).isEqualByComparingTo("1.0000");

        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("1.9900");
    }

    @Test
    void reimburse_creditOnly_callsRefundAccount() {
        Transaction tx = completedSale(
                new BigDecimal("1.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000"),
                List.of(payment(PaymentType.CREDIT, "10.0000")),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000")
        );
        tx.setCustomer(customer);
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(List.of()));

        verify(customerCreditService).refundAccount(
                eq(customer.getId()),
                eq(new BigDecimal("10.0000")),
                eq(tx)
        );
        verify(shiftService, never()).addDrawerEvent(any(), any());
    }

    @Test
    void reimburse_mixedCashAndCredit_allocatesCashFirstThenCredit() {
        Transaction tx = completedSale(
                new BigDecimal("1.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000"),
                List.of(
                        payment(PaymentType.CASH, "6.0000"),
                        payment(PaymentType.CREDIT, "4.0000")
                ),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000")
        );
        tx.setCustomer(customer);
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null));

        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("6.0000");
        verify(customerCreditService).refundAccount(
                eq(customer.getId()),
                eq(new BigDecimal("4.0000")),
                eq(tx)
        );
    }

    @Test
    void reimburse_mixedPartialThenRemainder_usesPriorReturnedForAllocation() {
        Transaction tx = completedSale(
                new BigDecimal("2.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000"),
                List.of(
                        payment(PaymentType.CASH, "6.0000"),
                        payment(PaymentType.CREDIT, "4.0000")
                ),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0000")
        );
        tx.setCustomer(customer);
        UUID itemId = tx.getItems().get(0).getId();
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        // First return half merchandise → R = 5.0000 → all cash
        transactionService.reimburse(
                tx.getId(),
                new ReimburseRequestDTO(List.of(new ReimburseLineRequestDTO(itemId, new BigDecimal("1.0000"))))
        );
        ArgumentCaptor<CashDrawerEventRequestDTO> firstEvent =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), firstEvent.capture());
        assertThat(firstEvent.getValue().amount()).isEqualByComparingTo("5.0000");
        verify(customerCreditService, never()).refundAccount(any(), any(), any());

        // Second return remaining → R = 5.0000; cashAlready=5, cashRemaining=1 → cash 1 + credit 4
        transactionService.reimburse(
                tx.getId(),
                new ReimburseRequestDTO(List.of(new ReimburseLineRequestDTO(itemId, new BigDecimal("1.0000"))))
        );
        ArgumentCaptor<CashDrawerEventRequestDTO> secondEvent =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService, org.mockito.Mockito.times(2))
                .addDrawerEvent(eq(openShift.id()), secondEvent.capture());
        assertThat(secondEvent.getAllValues().get(1).amount()).isEqualByComparingTo("1.0000");
        verify(customerCreditService).refundAccount(
                eq(customer.getId()),
                eq(new BigDecimal("4.0000")),
                eq(tx)
        );
    }

    @Test
    void reimburse_rejectsWhenAnyCardPayment() {
        Transaction tx = completedSale(
                new BigDecimal("1.0000"),
                new BigDecimal("5.0000"),
                new BigDecimal("0.0000"),
                List.of(payment(PaymentType.CARD, "5.0000")),
                new BigDecimal("5.0000"),
                new BigDecimal("0.0000")
        );
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));

        assertThatThrownBy(() -> transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("CARD");

        verify(transactionRepository, never()).save(any());
    }

    @Test
    void reimburse_rejectsOverReturn() {
        Transaction tx = cashSale(new BigDecimal("1.0000"), new BigDecimal("1.9900"), new BigDecimal("0.0000"));
        UUID itemId = tx.getItems().get(0).getId();
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));

        assertThatThrownBy(() -> transactionService.reimburse(
                tx.getId(),
                new ReimburseRequestDTO(List.of(new ReimburseLineRequestDTO(itemId, new BigDecimal("2.0000"))))
        ))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("exceeds returnable");
    }

    @Test
    void reimburse_emptyLines_returnsAllRemaining() {
        Transaction tx = cashSale(new BigDecimal("3.0000"), new BigDecimal("5.9700"), new BigDecimal("0.0000"));
        tx.getItems().get(0).setReturnedQuantity(new BigDecimal("1.0000"));
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        TransactionResponseDTO response = transactionService.reimburse(
                tx.getId(),
                new ReimburseRequestDTO(List.of())
        );

        assertThat(response.items().get(0).returnedQuantity()).isEqualByComparingTo("3.0000");
        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        // remaining 2/3 of 5.9700 = 3.9800
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("3.9800");
    }

    @Test
    void reimburse_includesTaxInRefundAmount() {
        Transaction tx = completedSale(
                new BigDecimal("1.0000"),
                new BigDecimal("10.0000"),
                new BigDecimal("1.0000"),
                List.of(payment(PaymentType.CASH, "11.0000")),
                new BigDecimal("11.0000"),
                new BigDecimal("0.0000")
        );
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null));

        ArgumentCaptor<CashDrawerEventRequestDTO> eventCaptor =
                ArgumentCaptor.forClass(CashDrawerEventRequestDTO.class);
        verify(shiftService).addDrawerEvent(eq(openShift.id()), eventCaptor.capture());
        assertThat(eventCaptor.getValue().amount()).isEqualByComparingTo("11.0000");
    }

    private Transaction cashSale(BigDecimal qty, BigDecimal lineTotal, BigDecimal taxTotal) {
        BigDecimal grand = lineTotal.add(taxTotal).setScale(4);
        return completedSale(
                qty,
                lineTotal,
                taxTotal,
                List.of(payment(PaymentType.CASH, grand.toPlainString())),
                grand,
                new BigDecimal("0.0000")
        );
    }

    private Transaction completedSale(
            BigDecimal qty,
            BigDecimal lineTotal,
            BigDecimal taxTotal,
            List<TransactionPayment> payments,
            BigDecimal amountReceived,
            BigDecimal changeGiven
    ) {
        Transaction tx = new Transaction();
        tx.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
        tx.setStore(store);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setSubtotal(lineTotal);
        tx.setTaxTotal(taxTotal);
        tx.setGrandTotal(lineTotal.add(taxTotal).setScale(4));
        tx.setAmountReceived(amountReceived);
        tx.setChangeGiven(changeGiven);
        tx.setGlobalDiscountPercentage(BigDecimal.ZERO.setScale(4));
        tx.setTotalDiscountAmount(BigDecimal.ZERO.setScale(4));

        TransactionItem item = new TransactionItem();
        item.setId(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
        item.setProduct(cola);
        item.setQuantity(qty);
        item.setPriceAtTime(lineTotal.divide(qty, 4, java.math.RoundingMode.HALF_UP));
        item.setOriginalUnitPrice(item.getPriceAtTime());
        item.setItemDiscountPercentage(BigDecimal.ZERO.setScale(4));
        item.setFinalUnitPrice(item.getPriceAtTime());
        item.setLineTotal(lineTotal);
        item.setReturnedQuantity(BigDecimal.ZERO.setScale(4));
        tx.addItem(item);

        for (TransactionPayment payment : payments) {
            tx.addPayment(payment);
        }
        return tx;
    }

    private static TransactionPayment payment(PaymentType method, String amount) {
        TransactionPayment payment = new TransactionPayment();
        payment.setId(UUID.randomUUID());
        payment.setPaymentMethod(method);
        payment.setAmount(new BigDecimal(amount));
        return payment;
    }
}
