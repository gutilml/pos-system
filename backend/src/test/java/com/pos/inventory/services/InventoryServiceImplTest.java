package com.pos.inventory.services;

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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
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
    void calculateYieldDeduction_oneUnitFrom24Pack_isFourDecimalHalfUp() {
        // 1 / 24 = 0.041666... → HALF_UP scale 4 = 0.0417
        BigDecimal deduction = inventoryService.calculateYieldDeduction(
                new BigDecimal("1.0000"),
                new BigDecimal("24.0000")
        );

        assertThat(deduction).isEqualByComparingTo("0.0417");
    }

    @Test
    void deductStock_individualUnit_deductsFractionalYieldFromParent() {
        Product parent = new Product();
        parent.setId(parentId);
        parent.setName("Cola Case");
        parent.setSellingPrice(new BigDecimal("40.0000"));
        parent.setCurrentStock(new BigDecimal("10.0000"));

        Product child = new Product();
        child.setId(childId);
        child.setName("Cola Can");
        child.setSellingPrice(new BigDecimal("1.9900"));
        child.setIndividualUnit(true);
        child.setUnitsPerPackage(new BigDecimal("24.0000"));
        child.setParentProduct(parent);
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
        // 10.0000 - 0.0417 = 9.9583
        assertThat(saved.getValue().getCurrentStock()).isEqualByComparingTo("9.9583");
    }

    @Test
    void deductStock_weightBasedItem_deductsExactQuantity() {
        Product deli = new Product();
        deli.setId(weightId);
        deli.setName("Deli Ham");
        deli.setSellingPrice(new BigDecimal("8.9900"));
        deli.setSellByWeight(true);
        deli.setCurrentStock(new BigDecimal("5.0000"));

        when(productRepository.findById(weightId)).thenReturn(Optional.of(deli));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TransactionItem item = new TransactionItem();
        item.setProduct(deli);
        item.setQuantity(new BigDecimal("0.2500")); // 250g

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
        verify(productRepository, times(1)).save(any(Product.class));
    }
}
