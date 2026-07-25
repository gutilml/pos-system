package com.pos.core.services;

import com.pos.auth.repositories.UserRepository;
import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Category;
import com.pos.core.models.Product;
import com.pos.core.models.ProductSku;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.ProductSkuRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

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
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductSkuRepository productSkuRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private static ProductRequestDTO req(
            List<String> skus,
            String name,
            BigDecimal cost,
            BigDecimal selling,
            UUID categoryId
    ) {
        return new ProductRequestDTO(
                skus, null, name, null, cost, selling, null, null, categoryId, null,
                null, null, null, null, null, null, null, null, null, null
        );
    }

    @Test
    void calculateSellingPriceFromMargin_usesRetailMarginFormula() {
        BigDecimal sellingPrice = productService.calculateSellingPriceFromMargin(
                new BigDecimal("70.0000"),
                new BigDecimal("0.3000")
        );
        assertThat(sellingPrice).isEqualByComparingTo("100.0000");
    }

    @Test
    void create_calculatesSellingPriceWhenMissingUsingCategoryMargin() {
        UUID categoryId = UUID.fromString("33333333-3333-3333-3333-333333333333");
        Category beverages = new Category();
        beverages.setId(categoryId);
        beverages.setName("Beverages");
        beverages.setTargetMargin(new BigDecimal("0.3000"));

        when(categoryRepository.findAllById(any())).thenReturn(List.of(beverages));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
            return product;
        });

        ProductDTO created = productService.create(
                req(List.of("SKU-M"), "Margin Product", new BigDecimal("70.0000"), null, categoryId));

        assertThat(created.sellingPrice()).isEqualByComparingTo("100.0000");
        assertThat(created.costPrice()).isEqualByComparingTo("70.0000");
        assertThat(created.targetMargin()).isEqualByComparingTo("0.3000");
        assertThat(created.primarySku()).isEqualTo("SKU-M");
    }

    @Test
    void create_derivesTargetMarginFromCostAndSellingWhenMissing() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
            return product;
        });

        ProductDTO created = productService.create(
                req(List.of("SKU-W"), "Bottled Water", new BigDecimal("3.5000"), new BigDecimal("8.0000"), null));

        assertThat(created.targetMargin()).isEqualByComparingTo("0.5625");
        assertThat(created.sellingPrice()).isEqualByComparingTo("8.0000");
    }

    @Test
    void update_backfillsTargetMarginWhenNullAndCostSellingPresent() {
        UUID id = UUID.fromString("77777777-7777-7777-7777-777777777777");
        Product existing = new Product();
        existing.setId(id);
        existing.setName("Legacy Product");
        existing.setCostPrice(new BigDecimal("3.5000"));
        existing.setSellingPrice(new BigDecimal("8.0000"));
        existing.setTargetMargin(null);
        existing.setActive(true);
        existing.setSellByWeight(false);
        existing.setExcludeFromGlobalDiscounts(false);

        when(productRepository.findById(id)).thenReturn(Optional.of(existing));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductRequestDTO request = new ProductRequestDTO(
                null, null, "Legacy Product Renamed", null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null
        );

        ProductDTO updated = productService.update(id, request);

        assertThat(updated.name()).isEqualTo("Legacy Product Renamed");
        assertThat(updated.targetMargin()).isEqualByComparingTo("0.5625");
        assertThat(updated.sellingPrice()).isEqualByComparingTo("8.0000");
        assertThat(updated.costPrice()).isEqualByComparingTo("3.5000");
    }

    @Test
    void create_allowsZeroCodes() {
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(UUID.fromString("44444444-4444-4444-4444-444444444444"));
            return product;
        });

        ProductDTO created = productService.create(
                req(List.of(), "Service Fee", new BigDecimal("10.0000"), new BigDecimal("10.0000"), null));

        assertThat(created.primarySku()).isNull();
        assertThat(created.skus()).isEmpty();
    }

    @Test
    void create_requiresSellingPriceWhenCategoryIdMissing() {
        assertThatThrownBy(() -> productService.create(
                req(null, "No Price", new BigDecimal("10.0000"), null, null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("sellingPrice");
    }

    @Test
    void create_rejectsDuplicateCode() {
        when(productSkuRepository.existsByCodeIgnoreCase("TAKEN")).thenReturn(true);
        assertThatThrownBy(() -> productService.create(
                req(List.of("TAKEN"), "Dup", null, new BigDecimal("1.0000"), null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already in use");
    }

    @Test
    void create_rejectsIncompleteParentPackage() {
        UUID parentId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        Product parent = new Product();
        parent.setId(parentId);
        parent.setName("Case");
        parent.setSellingPrice(new BigDecimal("10"));
        when(productRepository.findById(parentId)).thenReturn(Optional.of(parent));

        ProductRequestDTO request = new ProductRequestDTO(
                null, null, "Bottle", null, null, new BigDecimal("1"), null, null, null, null,
                true, "unit", parentId, null, null, null, null, null, null, null
        );

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("PARENT_PACKAGE_INCOMPLETE");
    }

    @Test
    void search_returnsEmptyForBlankQuery() {
        assertThat(productService.search("   ")).isEmpty();
        verify(productRepository, never()).findActiveByCodeIgnoreCase(any());
    }

    @Test
    void search_prefersExactActiveCodeMatch() {
        Product cola = productWithSku(
                UUID.fromString("55555555-5555-5555-5555-555555555555"),
                "Cola 12oz",
                "1001",
                true
        );
        when(productRepository.findActiveByCodeIgnoreCase("1001")).thenReturn(Optional.of(cola));

        List<ProductDTO> results = productService.search("1001");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).sku()).isEqualTo("1001");
        assertThat(results.get(0).trackInventory()).isFalse();
    }

    @Test
    void search_exactMatchOnSecondaryCode() {
        Product cola = productWithSkus(
                UUID.fromString("55555555-5555-5555-5555-555555555555"),
                "Cola 12oz",
                List.of("1001", "7501000000028")
        );
        when(productRepository.findActiveByCodeIgnoreCase("7501000000028")).thenReturn(Optional.of(cola));
        List<ProductDTO> results = productService.search("7501000000028");
        assertThat(results.get(0).skus()).containsExactly("1001", "7501000000028");
    }

    @Test
    void search_fallsBackToNameContainsWhenNoExactCode() {
        Product ham = productWithSku(
                UUID.fromString("66666666-6666-6666-6666-666666666666"),
                "Deli Ham",
                "2001",
                true
        );
        ham.setSellByWeight(true);
        ham.setUnitOfMeasure("lb");
        ham.setTrackInventory(true);
        ham.setCurrentStock(new BigDecimal("4.5000"));

        when(productRepository.findActiveByCodeIgnoreCase("ham")).thenReturn(Optional.empty());
        when(productRepository.searchActiveByNameOrCode(eq("ham"), any(Pageable.class)))
                .thenReturn(List.of(ham));

        List<ProductDTO> results = productService.search("ham");
        assertThat(results.get(0).sellByWeight()).isTrue();
        assertThat(results.get(0).currentStock()).isEqualByComparingTo("4.5000");
    }

    @Test
    void replaceSkus_hardDeletesPriorCodes() {
        UUID id = UUID.fromString("55555555-5555-5555-5555-555555555555");
        Product cola = productWithSku(id, "Cola", "OLD", true);
        when(productRepository.findById(id)).thenReturn(Optional.of(cola));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));
        when(productSkuRepository.existsByCodeIgnoreCaseAndProductIdNot("NEW", id)).thenReturn(false);

        ProductDTO updated = productService.replaceSkus(id, new ProductSkusUpdateDTO(List.of("NEW"), null));
        assertThat(updated.skus()).containsExactly("NEW");
    }

    private static Product productWithSku(UUID id, String name, String code, boolean primary) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setSellingPrice(new BigDecimal("1.9900"));
        product.setActive(true);
        product.setSellByWeight(false);
        product.setExcludeFromGlobalDiscounts(false);
        ProductSku sku = new ProductSku();
        sku.setProduct(product);
        sku.setCode(code);
        sku.setIsPrimary(primary);
        product.getSkus().add(sku);
        return product;
    }

    private static Product productWithSkus(UUID id, String name, List<String> codes) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setSellingPrice(new BigDecimal("1.9900"));
        product.setActive(true);
        product.setSellByWeight(false);
        product.setExcludeFromGlobalDiscounts(false);
        for (int i = 0; i < codes.size(); i++) {
            ProductSku sku = new ProductSku();
            sku.setProduct(product);
            sku.setCode(codes.get(i));
            sku.setIsPrimary(i == 0);
            product.getSkus().add(sku);
        }
        return product;
    }
}
