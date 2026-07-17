package com.pos.core.services;

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

        TransactionRequestDTO request = new TransactionRequestDTO(
                null,
                List.of(
                        new TransactionItemRequestDTO(cola.getId(), new BigDecimal("2.0000")),
                        new TransactionItemRequestDTO(chips.getId(), new BigDecimal("1.0000"))
                ),
                new BigDecimal("10.0000"),
                new BigDecimal("0.0825"),
                null,
                null
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("6.4800");
        assertThat(response.taxTotal()).isEqualByComparingTo("0.5346");
        assertThat(response.grandTotal()).isEqualByComparingTo("7.0146");
        assertThat(response.amountReceived()).isEqualByComparingTo("10.0000");
        assertThat(response.changeGiven()).isEqualByComparingTo("2.9854");
        assertThat(response.paymentType()).isEqualTo(PaymentType.CASH);
        assertThat(response.items()).hasSize(2);

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getSubtotal()).isEqualByComparingTo("6.4800");
        verify(inventoryService, never()).deductStock(anyList());
        verify(customerCreditService, never()).chargeAccount(any(), any(), any());
    }

    @Test
    void create_ignoresClientTotalsAndUsesCatalogPrice() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = new TransactionRequestDTO(
                null,
                List.of(new TransactionItemRequestDTO(cola.getId(), new BigDecimal("1.0000"))),
                new BigDecimal("5.0000"),
                null,
                null,
                null
        );

        TransactionResponseDTO response = transactionService.create(request);

        assertThat(response.subtotal()).isEqualByComparingTo("1.9900");
        assertThat(response.taxTotal()).isEqualByComparingTo("0.0000");
        assertThat(response.grandTotal()).isEqualByComparingTo("1.9900");
        assertThat(response.items().get(0).priceAtTime()).isEqualByComparingTo("1.9900");
    }

    @Test
    void create_rejectsInsufficientPayment() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));

        TransactionRequestDTO request = new TransactionRequestDTO(
                null,
                List.of(new TransactionItemRequestDTO(cola.getId(), new BigDecimal("1.0000"))),
                new BigDecimal("1.0000"),
                null,
                null,
                null
        );

        assertThatThrownBy(() -> transactionService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("amountReceived");
    }
}
