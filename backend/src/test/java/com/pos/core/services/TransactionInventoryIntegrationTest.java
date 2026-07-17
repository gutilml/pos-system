package com.pos.core.services;

import com.pos.core.dtos.TransactionItemRequestDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
import com.pos.inventory.services.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionInventoryIntegrationTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private Product cola;
    private StoreSettings store;

    @BeforeEach
    void setUp() {
        cola = new Product();
        cola.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        cola.setSku("COLA");
        cola.setName("Cola");
        cola.setSellingPrice(new BigDecimal("1.9900"));
        cola.setCurrentStock(new BigDecimal("50.0000"));

        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
        store.setStoreName("Corner Market");
    }

    @Test
    void create_whenInventoryDisabled_bypassesInventoryService() {
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_inventory", false);
        features.put("enable_customer_credit", false);
        store.setFeatures(features);

        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = new TransactionRequestDTO(
                store.getId(),
                List.of(new TransactionItemRequestDTO(cola.getId(), new BigDecimal("1.0000"))),
                new BigDecimal("5.0000"),
                null
        );

        transactionService.create(request);

        verify(inventoryService, never()).deductStock(anyList());
        // Stock must remain untouched when the module is opted out.
        org.assertj.core.api.Assertions.assertThat(cola.getCurrentStock()).isEqualByComparingTo("50.0000");
    }

    @Test
    void create_whenInventoryEnabled_callsInventoryServiceAfterSave() {
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_inventory", true);
        store.setFeatures(features);

        when(storeSettingsRepository.findById(store.getId())).thenReturn(Optional.of(store));
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = new TransactionRequestDTO(
                store.getId(),
                List.of(new TransactionItemRequestDTO(cola.getId(), new BigDecimal("2.0000"))),
                new BigDecimal("10.0000"),
                null
        );

        transactionService.create(request);

        verify(inventoryService).deductStock(anyList());
    }

    @Test
    void create_whenNoStore_bypassesInventoryService() {
        when(productRepository.findById(cola.getId())).thenReturn(Optional.of(cola));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionRequestDTO request = new TransactionRequestDTO(
                null,
                List.of(new TransactionItemRequestDTO(cola.getId(), new BigDecimal("1.0000"))),
                new BigDecimal("5.0000"),
                null
        );

        transactionService.create(request);

        verify(inventoryService, never()).deductStock(anyList());
    }
}
