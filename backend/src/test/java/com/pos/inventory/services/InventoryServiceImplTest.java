package com.pos.inventory.services;

import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.Transaction;
import com.pos.core.models.TransactionItem;
import com.pos.core.repositories.ProductRepository;
import com.pos.inventory.models.StockMovement;
import com.pos.inventory.models.StockMovementType;
import com.pos.inventory.repositories.StockMovementRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private UUID parentId;
    private UUID childId;
    private UUID weightId;
    private StoreSettings store;

    @BeforeEach
    void setUp() {
        parentId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        childId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        weightId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        store = new StoreSettings();
        store.setId(UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"));
    }

    @Test
    void calculateParentPackageDeduction_oneUnitFrom24Pack_isFourDecimalHalfUp() {
        BigDecimal deduction = inventoryService.calculateParentPackageDeduction(
                new BigDecimal("1.0000"),
                new BigDecimal("24.0000")
        );
        assertThat(deduction).isEqualByComparingTo("0.0417");
    }

    @Test
    void deductStock_childSale_deductsFractionalPackageFromParent() {
        Product parent = new Product();
        parent.setId(parentId);
        parent.setName("Cola Case");
        parent.setSellingPrice(new BigDecimal("40.0000"));
        parent.setTrackInventory(true);
        parent.setUnitsPerPackage(new BigDecimal("24.0000"));
        parent.setUnitOfMeasure("unit");
        parent.setCurrentStock(new BigDecimal("10.0000"));

        Product child = new Product();
        child.setId(childId);
        child.setName("Cola Can");
        child.setSellingPrice(new BigDecimal("1.9900"));
        child.setUnitOfMeasure("unit");
        child.setParentProduct(parent);
        child.setTrackInventory(false);
        child.setCurrentStock(new BigDecimal("0.0000"));

        when(productRepository.findById(childId)).thenReturn(Optional.of(child));
        when(productRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        TransactionItem item = itemWithStore(child, "1.0000");
        inventoryService.deductStock(List.of(item));

        assertThat(parent.getCurrentStock()).isEqualByComparingTo("9.9583");
        ArgumentCaptor<StockMovement> move = ArgumentCaptor.forClass(StockMovement.class);
        verify(stockMovementRepository).save(move.capture());
        assertThat(move.getValue().getType()).isEqualTo(StockMovementType.SALE);
    }

    @Test
    void deductStock_allowsNegativeStock() {
        Product parent = new Product();
        parent.setId(parentId);
        parent.setTrackInventory(true);
        parent.setUnitsPerPackage(new BigDecimal("24.0000"));
        parent.setUnitOfMeasure("unit");
        parent.setCurrentStock(new BigDecimal("0.0100"));
        parent.setSellingPrice(new BigDecimal("10"));

        Product child = new Product();
        child.setId(childId);
        child.setUnitOfMeasure("unit");
        child.setParentProduct(parent);
        child.setSellingPrice(new BigDecimal("1"));

        when(productRepository.findById(childId)).thenReturn(Optional.of(child));
        when(productRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(stockMovementRepository.save(any(StockMovement.class))).thenAnswer(inv -> inv.getArgument(0));

        inventoryService.deductStock(List.of(itemWithStore(child, "1.0000")));

        assertThat(parent.getCurrentStock()).isNegative();
    }

    @Test
    void deductStock_weightBasedItem_deductsExactQuantity() {
        Product deli = new Product();
        deli.setId(weightId);
        deli.setName("Deli Ham");
        deli.setSellingPrice(new BigDecimal("8.9900"));
        deli.setSellByWeight(true);
        deli.setTrackInventory(true);
        deli.setCurrentStock(new BigDecimal("5.0000"));

        when(productRepository.findById(weightId)).thenReturn(Optional.of(deli));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.deductStock(List.of(itemWithStore(deli, "0.2500")));

        assertThat(deli.getCurrentStock()).isEqualByComparingTo("4.7500");
    }

    @Test
    void deductStock_standardIntegerQuantity_deductsWholeUnits() {
        Product chips = new Product();
        chips.setId(weightId);
        chips.setName("Chips");
        chips.setSellingPrice(new BigDecimal("2.5000"));
        chips.setTrackInventory(true);
        chips.setCurrentStock(new BigDecimal("20.0000"));

        when(productRepository.findById(weightId)).thenReturn(Optional.of(chips));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        inventoryService.deductStock(List.of(itemWithStore(chips, "3.0000")));

        assertThat(chips.getCurrentStock()).isEqualByComparingTo("17.0000");
    }

    private TransactionItem itemWithStore(Product product, String qty) {
        Transaction tx = new Transaction();
        tx.setStore(store);
        TransactionItem item = new TransactionItem();
        item.setProduct(product);
        item.setQuantity(new BigDecimal(qty));
        item.setTransaction(tx);
        return item;
    }
}
