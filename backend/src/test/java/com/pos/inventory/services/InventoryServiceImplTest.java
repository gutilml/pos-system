package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Product;
import com.pos.core.models.TransactionItem;
import com.pos.core.repositories.ProductRepository;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private UUID parentId;
    private UUID childId;
    private UUID weightId;

    @BeforeEach
    void setUp() {
        parentId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        childId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        weightId = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
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

        TransactionItem item = new TransactionItem();
        item.setProduct(child);
        item.setQuantity(new BigDecimal("1.0000"));

        inventoryService.deductStock(List.of(item));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());

        assertThat(saved.getValue().getId()).isEqualTo(parentId);
        assertThat(saved.getValue().getCurrentStock()).isEqualByComparingTo("9.9583");
    }

    @Test
    void deductStock_childKgFromParentCase_convertsUnits() {
        Product parent = new Product();
        parent.setId(parentId);
        parent.setName("Bulk flour");
        parent.setSellingPrice(new BigDecimal("40.0000"));
        parent.setTrackInventory(true);
        parent.setUnitsPerPackage(new BigDecimal("1.0000"));
        parent.setUnitOfMeasure("kg");
        parent.setCurrentStock(new BigDecimal("10.0000"));

        Product child = new Product();
        child.setId(childId);
        child.setName("Flour 500g");
        child.setSellingPrice(new BigDecimal("2.0000"));
        child.setUnitOfMeasure("gr");
        child.setParentProduct(parent);
        child.setTrackInventory(false);

        when(productRepository.findById(childId)).thenReturn(Optional.of(child));
        when(productRepository.findById(parentId)).thenReturn(Optional.of(parent));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionItem item = new TransactionItem();
        item.setProduct(child);
        item.setQuantity(new BigDecimal("500.0000"));

        inventoryService.deductStock(List.of(item));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        // 500 gr → 0.5 kg; ÷ 1 package = 0.5 packages → 10 - 0.5 = 9.5
        assertThat(saved.getValue().getCurrentStock()).isEqualByComparingTo("9.5000");
    }

    @Test
    void deductStock_rejectsInsufficientParentStock() {
        Product parent = new Product();
        parent.setId(parentId);
        parent.setTrackInventory(true);
        parent.setUnitsPerPackage(new BigDecimal("24.0000"));
        parent.setUnitOfMeasure("unit");
        parent.setCurrentStock(new BigDecimal("0.0100"));

        Product child = new Product();
        child.setId(childId);
        child.setUnitOfMeasure("unit");
        child.setParentProduct(parent);

        when(productRepository.findById(childId)).thenReturn(Optional.of(child));
        when(productRepository.findById(parentId)).thenReturn(Optional.of(parent));

        TransactionItem item = new TransactionItem();
        item.setProduct(child);
        item.setQuantity(new BigDecimal("1.0000"));

        assertThatThrownBy(() -> inventoryService.deductStock(List.of(item)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient stock");
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

        TransactionItem item = new TransactionItem();
        item.setProduct(deli);
        item.setQuantity(new BigDecimal("0.2500"));

        inventoryService.deductStock(List.of(item));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStock()).isEqualByComparingTo("4.7500");
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

        TransactionItem item = new TransactionItem();
        item.setProduct(chips);
        item.setQuantity(new BigDecimal("3.0000"));

        inventoryService.deductStock(List.of(item));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).save(saved.capture());
        assertThat(saved.getValue().getCurrentStock()).isEqualByComparingTo("17.0000");
    }
}
