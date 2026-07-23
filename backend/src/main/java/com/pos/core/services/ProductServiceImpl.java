package com.pos.core.services;

import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Category;
import com.pos.core.models.Product;
import com.pos.core.models.ProductSku;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.ProductSkuRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;
    public static final int SEARCH_LIMIT = 25;

    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductSkuRepository productSkuRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.productSkuRepository = productSkuRepository;
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
    @Transactional(readOnly = true)
    public List<ProductDTO> search(String query) {
        String trimmed = query == null ? "" : query.trim();
        if (trimmed.isEmpty()) {
            return Collections.emptyList();
        }

        return productRepository.findActiveByCodeIgnoreCase(trimmed)
                .map(product -> List.of(toDto(product)))
                .orElseGet(() -> productRepository
                        .searchActiveByNameOrCode(trimmed, PageRequest.of(0, SEARCH_LIMIT))
                        .stream()
                        .map(this::toDto)
                        .toList());
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
        product.setName(request.name());
        product.setDescription(request.description());
        product.setCostPrice(costPrice);
        product.setSellingPrice(sellingPrice);
        product.setCategories(categories);

        applySkus(product, request.skus(), request.primarySku());

        return toDto(productRepository.save(product));
    }

    @Override
    public ProductDTO replaceSkus(UUID productId, ProductSkusUpdateDTO request) {
        Product product = getProduct(productId);
        applySkus(product, request.skus(), request.primarySku());
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

    private void applySkus(Product product, List<String> rawSkus, String rawPrimary) {
        List<String> codes = normalizeSkuList(rawSkus);
        String primary = resolvePrimaryCode(codes, rawPrimary);

        product.getSkus().clear();
        productRepository.flush();

        for (String code : codes) {
            assertCodeAvailable(code, product.getId());
            ProductSku sku = new ProductSku();
            sku.setProduct(product);
            sku.setCode(code);
            sku.setIsPrimary(code.equalsIgnoreCase(primary));
            product.getSkus().add(sku);
        }
    }

    private void assertCodeAvailable(String code, UUID productId) {
        boolean taken = productId == null
                ? productSkuRepository.existsByCodeIgnoreCase(code)
                : productSkuRepository.existsByCodeIgnoreCaseAndProductIdNot(code, productId);
        if (taken) {
            throw new BusinessRuleException("SKU already in use: " + code);
        }
    }

    private static List<String> normalizeSkuList(List<String> rawSkus) {
        if (rawSkus == null || rawSkus.isEmpty()) {
            return List.of();
        }

        List<String> normalized = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (String raw : rawSkus) {
            if (raw == null) {
                throw new BusinessRuleException("SKU codes cannot be blank");
            }
            String code = raw.trim();
            if (code.isEmpty()) {
                throw new BusinessRuleException("SKU codes cannot be blank");
            }
            String key = code.toLowerCase(Locale.ROOT);
            if (!seen.add(key)) {
                throw new BusinessRuleException("Duplicate SKU in request: " + code);
            }
            normalized.add(code);
        }
        return normalized;
    }

    private static String resolvePrimaryCode(List<String> codes, String rawPrimary) {
        if (codes.isEmpty()) {
            if (rawPrimary != null && !rawPrimary.trim().isEmpty()) {
                throw new BusinessRuleException("primarySku requires at least one code in skus");
            }
            return null;
        }

        if (rawPrimary == null || rawPrimary.trim().isEmpty()) {
            return codes.get(0);
        }

        String primary = rawPrimary.trim();
        boolean present = codes.stream().anyMatch(c -> c.equalsIgnoreCase(primary));
        if (!present) {
            throw new BusinessRuleException("primarySku must be one of the provided skus");
        }
        return codes.stream()
                .filter(c -> c.equalsIgnoreCase(primary))
                .findFirst()
                .orElse(primary);
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

        String primarySku = product.resolvePrimarySku();
        List<String> skus = orderedSkuCodes(product);

        return new ProductDTO(
                product.getId(),
                primarySku,
                primarySku,
                skus,
                product.getName(),
                product.getDescription(),
                product.getCostPrice(),
                product.getSellingPrice(),
                product.getActive(),
                categoryIds,
                Boolean.TRUE.equals(product.getSellByWeight()),
                product.getUnitOfMeasure(),
                Boolean.TRUE.equals(product.getExcludeFromGlobalDiscounts())
        );
    }

    private static List<String> orderedSkuCodes(Product product) {
        String primary = product.resolvePrimarySku();
        List<String> codes = new ArrayList<>();
        if (primary != null) {
            codes.add(primary);
        }
        for (ProductSku sku : product.getSkus()) {
            if (primary == null || !sku.getCode().equalsIgnoreCase(primary)) {
                codes.add(sku.getCode());
            }
        }
        return codes;
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
