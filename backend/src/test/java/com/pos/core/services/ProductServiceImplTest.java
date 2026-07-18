package com.pos.core.services;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.Category;
import com.pos.core.models.Product;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void calculateSellingPriceFromMargin_usesRetailMarginFormula() {
        // cost 70 / (1 - 0.30) = 100.0000
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

        ProductRequestDTO request = new ProductRequestDTO(
                "SKU-M",
                "Margin Product",
                null,
                new BigDecimal("70.0000"),
                null,
                categoryId,
                null
        );

        ProductDTO created = productService.create(request);

        assertThat(created.sellingPrice()).isEqualByComparingTo("100.0000");
        assertThat(created.costPrice()).isEqualByComparingTo("70.0000");
    }

    @Test
    void create_requiresSellingPriceWhenCategoryIdMissing() {
        ProductRequestDTO request = new ProductRequestDTO(
                "SKU-X",
                "No Price",
                null,
                new BigDecimal("10.0000"),
                null,
                null,
                null
        );

        assertThatThrownBy(() -> productService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("sellingPrice");
    }

    @Test
    void search_returnsEmptyForBlankQuery() {
        assertThat(productService.search("   ")).isEmpty();
        verify(productRepository, never()).findBySkuIgnoreCaseAndActiveTrue(any());
    }

    @Test
    void search_prefersExactActiveSkuMatch() {
        Product cola = new Product();
        cola.setId(UUID.fromString("55555555-5555-5555-5555-555555555555"));
        cola.setSku("1001");
        cola.setName("Cola 12oz");
        cola.setSellingPrice(new BigDecimal("1.9900"));
        cola.setActive(true);
        cola.setSellByWeight(false);
        cola.setExcludeFromGlobalDiscounts(false);

        when(productRepository.findBySkuIgnoreCaseAndActiveTrue("1001")).thenReturn(Optional.of(cola));

        List<ProductDTO> results = productService.search("1001");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).sku()).isEqualTo("1001");
        assertThat(results.get(0).sellByWeight()).isFalse();
        assertThat(results.get(0).excludeFromGlobalDiscounts()).isFalse();
        verify(productRepository, never()).searchActiveByNameOrSku(any(), any());
    }

    @Test
    void search_fallsBackToNameContainsWhenNoExactSku() {
        Product ham = new Product();
        ham.setId(UUID.fromString("66666666-6666-6666-6666-666666666666"));
        ham.setSku("2001");
        ham.setName("Deli Ham");
        ham.setSellingPrice(new BigDecimal("8.9900"));
        ham.setActive(true);
        ham.setSellByWeight(true);
        ham.setUnitOfMeasure("lb");
        ham.setExcludeFromGlobalDiscounts(false);

        when(productRepository.findBySkuIgnoreCaseAndActiveTrue("ham")).thenReturn(Optional.empty());
        when(productRepository.searchActiveByNameOrSku(eq("ham"), any(Pageable.class)))
                .thenReturn(List.of(ham));

        List<ProductDTO> results = productService.search("ham");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).name()).isEqualTo("Deli Ham");
        assertThat(results.get(0).sellByWeight()).isTrue();
        assertThat(results.get(0).unitOfMeasure()).isEqualTo("lb");
    }
}
