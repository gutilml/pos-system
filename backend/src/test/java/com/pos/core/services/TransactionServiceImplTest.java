package com.pos.core.services;

import com.pos.core.dtos.PaymentRequestDTO;
import com.pos.core.dtos.TransactionItemRequestDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.PaymentType;
import com.pos.core.models.Product;
import com.pos.core.models.Transaction;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.ShiftRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
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

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private Product cola;
    private Product chips;
    private Product specialPrice;
    private Customer customer;

    @BeforeEach
    void setUp() {
        cola = new Product();
        cola.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        cola.setSku("COLA");
        cola.setName("Cola");
        cola.setSellingPrice(new BigDecimal("1.9900"));

        chips = new Product();
        chips.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        chips.setSku("CHIPS");
        chips.setName("Chips");
        chips.setSellingPrice(new BigDecimal("2.5000"));

        specialPrice = new Product();
        specialPrice.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
        specialPrice.setSku("SPECIAL");
        specialPrice.setName("Special Price Item");
        specialPrice.setSellingPrice(new BigDecimal("2.5000"));
        specialPrice.setExcludeFromGlobalDiscounts(true);

        customer = new Customer();
        customer.setId(UUID.fromString("33333333-3333-3333-3333-333333333333"));
        customer.setName("Dana Tab");
        customer.setCreditLimit(new BigDecimal("500.0000"));
        customer.setCurrentBalance(BigDecimal.ZERO);
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
    void create_appliesCascadingItemAndGlobalDiscountsWithExclusion() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(productRepository.findById(specialPrice.getId())).thenReturn(Optional.of(specialPrice));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(
                        line(cola.getId(), new BigDecimal("1.0000"), new BigDecimal("0.1000")),
                        line(specialPrice.getId(), new BigDecimal("1.0000"))
                ),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("5.0000"))),
                null,
                null,
                new BigDecimal("0.1000")
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.globalDiscountPercentage()).isEqualByComparingTo("0.1000");
        assertThat(response.subtotal()).isEqualByComparingTo("4.1119");
        assertThat(response.totalDiscountAmount()).isEqualByComparingTo("0.3781");
        assertThat(response.grandTotal()).isEqualByComparingTo("4.1119");

        assertThat(response.items().get(0).originalUnitPrice()).isEqualByComparingTo("1.9900");
        assertThat(response.items().get(0).finalUnitPrice()).isEqualByComparingTo("1.6119");
        assertThat(response.items().get(1).finalUnitPrice()).isEqualByComparingTo("2.5000");

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        Transaction saved = captor.getValue();
        assertThat(saved.getItems().get(0).getFinalUnitPrice()).isEqualByComparingTo("1.6119");
        assertThat(saved.getItems().get(1).getFinalUnitPrice()).isEqualByComparingTo("2.5000");
    }

    @Test
    void create_appliesItemAndGlobalDiscountOnSameLine() {
        Product premium = new Product();
        premium.setId(UUID.fromString("55555555-5555-5555-5555-555555555555"));
        premium.setSku("PREMIUM");
        premium.setName("Premium");
        premium.setSellingPrice(new BigDecimal("100.0000"));

        when(productRepository.findById(premium.getId())).thenReturn(Optional.of(premium));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = request(
                List.of(line(premium.getId(), new BigDecimal("1.0000"), new BigDecimal("0.1000"))),
                List.of(new PaymentRequestDTO(PaymentType.CASH, new BigDecimal("81.0000"))),
                null,
                null,
                new BigDecimal("0.1000")
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("81.0000");
        assertThat(response.totalDiscountAmount()).isEqualByComparingTo("19.0000");
        assertThat(response.items().get(0).finalUnitPrice()).isEqualByComparingTo("81.0000");
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
}
