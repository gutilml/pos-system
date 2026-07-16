package com.pos.core.repositories;

import com.pos.core.models.Category;
import com.pos.core.models.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void findHighestTargetMarginByProductId_returnsMaxMarginAcrossCategories() {
        Category low = new Category();
        low.setName("Snacks");
        low.setTargetMargin(new BigDecimal("0.1500"));

        Category high = new Category();
        high.setName("Beverages");
        high.setTargetMargin(new BigDecimal("0.3000"));

        categoryRepository.save(low);
        categoryRepository.save(high);

        Product product = new Product();
        product.setSku("SKU-001");
        product.setName("Cola 12oz");
        product.setSellingPrice(new BigDecimal("1.9900"));
        product.setCostPrice(new BigDecimal("1.0333"));
        product.getCategories().add(low);
        product.getCategories().add(high);

        Product saved = productRepository.saveAndFlush(product);

        BigDecimal highestMargin = productRepository
                .findHighestTargetMarginByProductId(saved.getId())
                .orElseThrow();

        assertThat(highestMargin).isEqualByComparingTo(new BigDecimal("0.3000"));
    }

    @Test
    void saveAndLoad_preservesBigDecimalPrecision() {
        Product product = new Product();
        product.setSku("SKU-PREC");
        product.setName("Weighted Item");
        product.setSellingPrice(new BigDecimal("12.3456"));
        product.setCostPrice(new BigDecimal("1.0333"));
        product.setCurrentStock(new BigDecimal("10.2500"));
        product.setUnitsPerPackage(new BigDecimal("6.0000"));

        Product saved = productRepository.saveAndFlush(product);

        Product loaded = productRepository.findById(saved.getId()).orElseThrow();

        assertThat(loaded.getCostPrice()).isEqualByComparingTo(new BigDecimal("1.0333"));
        assertThat(loaded.getSellingPrice()).isEqualByComparingTo(new BigDecimal("12.3456"));
        assertThat(loaded.getCurrentStock()).isEqualByComparingTo(new BigDecimal("10.2500"));
        assertThat(loaded.getUnitsPerPackage()).isEqualByComparingTo(new BigDecimal("6.0000"));
    }
}
