package com.pos.core.services;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Category;
import com.pos.core.models.Product;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDTO findById(UUID id) {
        return toDto(getProduct(id));
    }

    @Override
    public ProductDTO create(ProductRequestDTO request) {
        Set<UUID> categoryIds = resolveCategoryIds(request);
        Set<Category> categories = loadCategories(categoryIds);

        BigDecimal costPrice = request.costPrice() != null
                ? scaleMoney(request.costPrice())
                : BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);

        BigDecimal sellingPrice = resolveSellingPrice(request.sellingPrice(), costPrice, request.categoryId(), categories);

        Product product = new Product();
        product.setSku(request.sku());
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCostPrice(costPrice);
        product.setSellingPrice(sellingPrice);
        product.setCategories(categories);

        return toDto(productRepository.save(product));
    }

    /**
     * Retail margin formula: sellingPrice = costPrice / (1 - targetMargin).
     * Example: cost 70, margin 0.30 → 70 / 0.70 = 100.
     */
    public BigDecimal calculateSellingPriceFromMargin(BigDecimal costPrice, BigDecimal targetMargin) {
        if (costPrice == null) {
            throw new BusinessRuleException("costPrice is required to calculate sellingPrice from margin");
        }
        if (targetMargin == null) {
            throw new BusinessRuleException("targetMargin is required to calculate sellingPrice");
        }
        if (targetMargin.compareTo(BigDecimal.ONE) >= 0) {
            throw new BusinessRuleException("targetMargin must be less than 1.0000");
        }
        if (targetMargin.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException("targetMargin cannot be negative");
        }

        BigDecimal divisor = BigDecimal.ONE.subtract(targetMargin);
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new BusinessRuleException("targetMargin of 1.0000 would divide by zero");
        }

        return costPrice.divide(divisor, MONEY_SCALE, MONEY_ROUNDING);
    }

    private BigDecimal resolveSellingPrice(
            BigDecimal requestedSellingPrice,
            BigDecimal costPrice,
            UUID categoryId,
            Set<Category> categories
    ) {
        if (requestedSellingPrice != null) {
            return scaleMoney(requestedSellingPrice);
        }

        if (categoryId == null) {
            throw new BusinessRuleException(
                    "sellingPrice is required when categoryId is not provided for margin-based pricing"
            );
        }

        Category marginCategory = categories.stream()
                .filter(c -> c.getId().equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + categoryId));

        return calculateSellingPriceFromMargin(costPrice, marginCategory.getTargetMargin());
    }

    private Set<UUID> resolveCategoryIds(ProductRequestDTO request) {
        Set<UUID> ids = new LinkedHashSet<>();
        if (request.categoryIds() != null) {
            ids.addAll(request.categoryIds());
        }
        if (request.categoryId() != null) {
            ids.add(request.categoryId());
        }
        return ids;
    }

    private Set<Category> loadCategories(Set<UUID> categoryIds) {
        if (categoryIds.isEmpty()) {
            return new HashSet<>();
        }

        List<Category> found = categoryRepository.findAllById(categoryIds);
        if (found.size() != categoryIds.size()) {
            Set<UUID> foundIds = found.stream().map(Category::getId).collect(Collectors.toSet());
            UUID missing = categoryIds.stream().filter(id -> !foundIds.contains(id)).findFirst().orElseThrow();
            throw new ResourceNotFoundException("Category not found: " + missing);
        }
        return new HashSet<>(found);
    }

    private Product getProduct(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    private ProductDTO toDto(Product product) {
        List<UUID> categoryIds = product.getCategories().stream()
                .map(Category::getId)
                .sorted()
                .toList();

        return new ProductDTO(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getCostPrice(),
                product.getSellingPrice(),
                product.getActive(),
                categoryIds
        );
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
