package com.pos.core.services;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
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
import com.pos.customers.repositories.CustomerRepository;
import com.pos.customers.services.CustomerCreditService;
import com.pos.inventory.services.InventoryService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionCashierOwnershipTest {

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
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private StoreSettings store;
    private User cashier;
    private User otherCashier;
    private User admin;
    private Product cola;
    private ShiftDTO openShift;

    @BeforeEach
    void setUp() {
        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        store.setStoreName("Corner Market");

        cola = new Product();
        cola.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        cola.setName("Cola");
        cola.setSellingPrice(new BigDecimal("1.9900"));

        cashier = user(UUID.fromString("00000000-0000-0000-0000-000000000401"), "cashier", Role.CASHIER);
        otherCashier = user(UUID.fromString("00000000-0000-0000-0000-000000000402"), "other", Role.CASHIER);
        admin = user(UUID.fromString("00000000-0000-0000-0000-000000000403"), "admin", Role.ADMIN);

        openShift = new ShiftDTO(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                store.getId(),
                ShiftStatus.OPEN,
                new BigDecimal("100.0000"),
                null, null, null, null, null, null, null,
                null, null,
                null, null, null, null
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void list_cashier_filtersToOwnTickets() {
        authenticate(cashier);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(transactionRepository.findByStoreIdAndStatusAndCreatedByOrderByCreatedAtDesc(
                store.getId(), TransactionStatus.COMPLETED, cashier.getId()
        )).thenReturn(List.of(ownedSale(cashier.getId())));

        List<TransactionResponseDTO> listed = transactionService.list(store.getId());

        assertThat(listed).hasSize(1);
        assertThat(listed.get(0).createdBy()).isEqualTo(cashier.getId());
        verify(transactionRepository, never()).findByStoreIdAndStatusOrderByCreatedAtDesc(any(), any());
    }

    @Test
    void list_admin_seesAllStoreTicketsIncludingLegacyNullOwner() {
        authenticate(admin);
        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        Transaction own = ownedSale(cashier.getId());
        Transaction legacy = ownedSale(null);
        when(transactionRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(
                store.getId(), TransactionStatus.COMPLETED
        )).thenReturn(List.of(own, legacy));

        List<TransactionResponseDTO> listed = transactionService.list(store.getId());

        assertThat(listed).hasSize(2);
        verify(transactionRepository, never()).findByStoreIdAndStatusAndCreatedByOrderByCreatedAtDesc(
                any(), any(), any());
    }

    @Test
    void get_cashier_otherTicket_forbidden() {
        authenticate(cashier);
        when(transactionRepository.findById(any())).thenReturn(Optional.of(ownedSale(otherCashier.getId())));

        assertThatThrownBy(() -> transactionService.get(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("view");
    }

    @Test
    void get_cashier_legacyNullOwner_forbidden() {
        authenticate(cashier);
        when(transactionRepository.findById(any())).thenReturn(Optional.of(ownedSale(null)));

        assertThatThrownBy(() -> transactionService.get(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("view");
    }

    @Test
    void get_admin_canViewOtherAndLegacy() {
        authenticate(admin);
        Transaction legacy = ownedSale(null);
        when(transactionRepository.findById(legacy.getId())).thenReturn(Optional.of(legacy));

        TransactionResponseDTO dto = transactionService.get(legacy.getId());

        assertThat(dto.id()).isEqualTo(legacy.getId());
        assertThat(dto.createdBy()).isNull();
    }

    @Test
    void reimburse_cashier_ownTicket_allowed() {
        authenticate(cashier);
        Transaction tx = ownedSale(cashier.getId());
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        TransactionResponseDTO response = transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null));

        assertThat(response.items().get(0).returnedQuantity()).isEqualByComparingTo("1.0000");
        verify(shiftService).addDrawerEvent(eq(openShift.id()), any(CashDrawerEventRequestDTO.class));
    }

    @Test
    void reimburse_cashier_otherTicket_forbidden() {
        authenticate(cashier);
        when(transactionRepository.findById(any())).thenReturn(Optional.of(ownedSale(otherCashier.getId())));

        assertThatThrownBy(() ->
                transactionService.reimburse(
                        UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                        new ReimburseRequestDTO(null)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("reimburse");
    }

    @Test
    void reimburse_cashier_legacyNullOwner_forbidden() {
        authenticate(cashier);
        when(transactionRepository.findById(any())).thenReturn(Optional.of(ownedSale(null)));

        assertThatThrownBy(() ->
                transactionService.reimburse(
                        UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                        new ReimburseRequestDTO(null)))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("reimburse");
    }

    @Test
    void reimburse_admin_canReimburseOtherTicket() {
        authenticate(admin);
        Transaction tx = ownedSale(cashier.getId());
        when(transactionRepository.findById(tx.getId())).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));
        when(shiftService.getCurrentOpenShift(store.getId())).thenReturn(openShift);

        TransactionResponseDTO response = transactionService.reimburse(tx.getId(), new ReimburseRequestDTO(null));

        assertThat(response.items().get(0).returnedQuantity()).isEqualByComparingTo("1.0000");
    }

    private void authenticate(User user) {
        var details = new PosUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities())
        );
        when(userRepository.findByUsernameIgnoreCase(user.getUsername())).thenReturn(Optional.of(user));
    }

    private User user(UUID id, String username, Role role) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setPasswordHash("hash");
        user.setRole(role);
        user.setStore(store);
        user.setActive(true);
        return user;
    }

    private Transaction ownedSale(UUID createdBy) {
        Transaction tx = new Transaction();
        tx.setId(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));
        tx.setStore(store);
        tx.setCreatedBy(createdBy);
        tx.setStatus(TransactionStatus.COMPLETED);
        tx.setSubtotal(new BigDecimal("1.9900"));
        tx.setTaxTotal(BigDecimal.ZERO.setScale(4));
        tx.setGrandTotal(new BigDecimal("1.9900"));
        tx.setAmountReceived(new BigDecimal("5.0000"));
        tx.setChangeGiven(new BigDecimal("3.0100"));
        tx.setGlobalDiscountPercentage(BigDecimal.ZERO.setScale(4));
        tx.setTotalDiscountAmount(BigDecimal.ZERO.setScale(4));

        TransactionItem item = new TransactionItem();
        item.setId(UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"));
        item.setProduct(cola);
        item.setQuantity(new BigDecimal("1.0000"));
        item.setPriceAtTime(new BigDecimal("1.9900"));
        item.setOriginalUnitPrice(new BigDecimal("1.9900"));
        item.setItemDiscountPercentage(BigDecimal.ZERO.setScale(4));
        item.setFinalUnitPrice(new BigDecimal("1.9900"));
        item.setLineTotal(new BigDecimal("1.9900"));
        item.setReturnedQuantity(BigDecimal.ZERO.setScale(4));
        tx.addItem(item);

        TransactionPayment payment = new TransactionPayment();
        payment.setId(UUID.randomUUID());
        payment.setPaymentMethod(PaymentType.CASH);
        payment.setAmount(new BigDecimal("5.0000"));
        tx.addPayment(payment);
        return tx;
    }
}
