package com.pos.core.services;

import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.ProductDTO;
import com.pos.core.dtos.ProductRequestDTO;
import com.pos.core.dtos.ProductSkusUpdateDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Category;
import com.pos.core.models.Product;
import com.pos.core.models.ProductSku;
import com.pos.core.models.StoreSettings;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.CategoryRepository;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.ProductSkuRepository;
import com.pos.inventory.services.InventoryAdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    public static final int MONEY_SCALE = ProductPricing.MONEY_SCALE;
    public static final int SEARCH_LIMIT = 25;

    private final ProductRepository productRepository;
    private final ProductSkuRepository productSkuRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductSkuRepository productSkuRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository
    ) {
        this.productRepository = productRepository;
        this.productSkuRepository = productSkuRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream().map(this::toDto).toList();
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
        Product product = new Product();
        applyRequest(product, request, true);
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Override
    public ProductDTO update(UUID id, ProductRequestDTO request) {
        Product product = getProduct(id);
        applyRequest(product, request, false);
        Product saved = productRepository.save(product);
        refreshChildrenCostsIfParent(saved);
        return toDto(saved);
    }

    @Override
    public ProductDTO replaceSkus(UUID productId, ProductSkusUpdateDTO request) {
        Product product = getProduct(productId);
        applySkus(product, request.skus(), request.primarySku());
        return toDto(productRepository.save(product));
    }

    /** @deprecated prefer {@link ProductPricing#sellingPriceFromMargin} */
    public BigDecimal calculateSellingPriceFromMargin(BigDecimal costPrice, BigDecimal targetMargin) {
        return ProductPricing.sellingPriceFromMargin(costPrice, targetMargin);
    }

    private void applyRequest(Product product, ProductRequestDTO request, boolean creating) {
        Set<UUID> categoryIds = resolveCategoryIds(request);
        Set<Category> categories = loadCategories(categoryIds);

        product.setName(request.name());
        product.setDescription(request.description());
        product.setCategories(categories);

        if (request.active() != null) {
            product.setActive(request.active());
        } else if (creating) {
            product.setActive(true);
        }

        if (request.excludeFromGlobalDiscounts() != null) {
            product.setExcludeFromGlobalDiscounts(request.excludeFromGlobalDiscounts());
        }

        boolean sellByWeight = Boolean.TRUE.equals(request.sellByWeight());
        product.setSellByWeight(sellByWeight);
        if (sellByWeight) {
            if (request.unitOfMeasure() == null || request.unitOfMeasure().isBlank()) {
                throw new BusinessRuleException("unitOfMeasure is required when sellByWeight is true");
            }
            product.setUnitOfMeasure(request.unitOfMeasure().trim());
        } else if (request.unitOfMeasure() != null && !request.unitOfMeasure().isBlank()) {
            product.setUnitOfMeasure(request.unitOfMeasure().trim());
        }

        applyParentLink(product, request);
        applyPackageFields(product, request);
        applyInventoryFields(product, request);

        BigDecimal costPrice = resolveCost(product, request);
        product.setCostPrice(costPrice);

        BigDecimal wholesale = request.wholesalePrice() != null
                ? ProductPricing.scaleMoney(request.wholesalePrice())
                : (product.getWholesalePrice() != null ? product.getWholesalePrice() : BigDecimal.ZERO);
        product.setWholesalePrice(wholesale);
        product.setWholesaleMargin(InventoryAdminService.computeWholesaleMargin(costPrice, wholesale));

        resolveAndApplyPricing(product, request, categories, costPrice);

        if (creating || request.skus() != null || request.primarySku() != null) {
            applySkus(product, request.skus(), request.primarySku());
        }
    }

    private BigDecimal resolveCost(Product product, ProductRequestDTO request) {
        if (product.getParentProduct() != null) {
            Product parent = product.getParentProduct();
            ensureParentPackageComplete(parent);
            String childUnit = product.getUnitOfMeasure() != null
                    ? product.getUnitOfMeasure()
                    : parent.getUnitOfMeasure();
            return ProductPricing.childCostFromParent(
                    parent.getCostPrice(),
                    parent.getUnitsPerPackage(),
                    parent.getUnitOfMeasure(),
                    childUnit
            );
        }
        if (request.costPrice() != null) {
            return ProductPricing.scaleMoney(request.costPrice());
        }
        if (product.getCostPrice() != null) {
            return product.getCostPrice();
        }
        return BigDecimal.ZERO.setScale(MONEY_SCALE, ProductPricing.MONEY_ROUNDING);
    }

    private void resolveAndApplyPricing(
            Product product,
            ProductRequestDTO request,
            Set<Category> categories,
            BigDecimal costPrice
    ) {
        BigDecimal storeDefault = resolveCallerStoreDefaultMargin();
        BigDecimal categoryMargin = resolveCategoryMargin(request.categoryId(), categories);

        if (request.targetMargin() != null && request.sellingPrice() != null) {
            ProductPricing.assertValidMargin(request.targetMargin());
            product.setTargetMargin(ProductPricing.scaleMoney(request.targetMargin()));
            product.setSellingPrice(ProductPricing.scaleMoney(request.sellingPrice()));
        } else if (request.targetMargin() != null) {
            ProductPricing.assertValidMargin(request.targetMargin());
            product.setTargetMargin(ProductPricing.scaleMoney(request.targetMargin()));
            product.setSellingPrice(ProductPricing.sellingPriceFromMargin(costPrice, product.getTargetMargin()));
        } else if (request.sellingPrice() != null) {
            BigDecimal selling = ProductPricing.scaleMoney(request.sellingPrice());
            product.setSellingPrice(selling);
            if (costPrice.compareTo(BigDecimal.ZERO) > 0 && selling.compareTo(BigDecimal.ZERO) > 0) {
                product.setTargetMargin(ProductPricing.marginFromCostAndPrice(costPrice, selling));
            }
        } else {
            BigDecimal effective = firstNonNull(product.getTargetMargin(), categoryMargin, storeDefault);
            if (effective != null) {
                product.setSellingPrice(ProductPricing.sellingPriceFromMargin(costPrice, effective));
            } else if (product.getSellingPrice() == null) {
                throw new BusinessRuleException(
                        "sellingPrice is required when no margin is available (product/category/store)");
            }
            // else: keep existing sellingPrice; ensureStoredTargetMargin may persist derived margin
        }

        ensureStoredTargetMargin(product, costPrice);
    }

    /** Persist derived target_margin when missing and cost + selling allow it. */
    private void ensureStoredTargetMargin(Product product, BigDecimal costPrice) {
        BigDecimal selling = product.getSellingPrice();
        BigDecimal filled = ProductPricing.backfillTargetMargin(costPrice, selling, product.getTargetMargin());
        if (filled != null && product.getTargetMargin() == null) {
            product.setTargetMargin(filled);
        }
    }

    private void applyParentLink(Product product, ProductRequestDTO request) {
        if (request.parentProductId() != null) {
            if (product.getId() != null && request.parentProductId().equals(product.getId())) {
                throw new BusinessRuleException("Product cannot be its own parent");
            }
            Product parent = getProduct(request.parentProductId());
            ensureParentPackageComplete(parent);
            product.setParentProduct(parent);
            product.setIndividualUnit(true);
            product.setUnitsPerPackage(null);
            return;
        }
        product.setParentProduct(null);
        product.setIndividualUnit(false);
    }

    private void applyPackageFields(Product product, ProductRequestDTO request) {
        if (product.getParentProduct() != null) {
            product.setUnitsPerPackage(null);
            return;
        }
        if (request.qtyPerPackage() != null) {
            if (request.qtyPerPackage().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessRuleException("qtyPerPackage must be greater than zero");
            }
            product.setUnitsPerPackage(request.qtyPerPackage().setScale(MONEY_SCALE, ProductPricing.MONEY_ROUNDING));
        }
        if (request.packageUnit() != null && !request.packageUnit().isBlank()) {
            product.setUnitOfMeasure(request.packageUnit().trim());
        }
    }

    private void applyInventoryFields(Product product, ProductRequestDTO request) {
        boolean inventoryEnabled = isCallerInventoryEnabled();
        if (!inventoryEnabled) {
            if (Boolean.TRUE.equals(request.trackInventory())) {
                throw new BusinessRuleException("Inventory fields are disabled for this store");
            }
            return;
        }
        if (request.trackInventory() != null) {
            product.setTrackInventory(request.trackInventory());
        }
        if (Boolean.TRUE.equals(product.getTrackInventory())) {
            if (request.currentStock() != null) {
                product.setCurrentStock(request.currentStock().setScale(MONEY_SCALE, ProductPricing.MONEY_ROUNDING));
            }
            if (request.lowStockThreshold() != null) {
                product.setLowStockThreshold(
                        request.lowStockThreshold().setScale(MONEY_SCALE, ProductPricing.MONEY_ROUNDING));
            }
        }
    }

    private void ensureParentPackageComplete(Product parent) {
        if (parent.getUnitsPerPackage() == null || parent.getUnitsPerPackage().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException(
                    "PARENT_PACKAGE_INCOMPLETE: Parent product is missing qtyPerPackage");
        }
        if (parent.getUnitOfMeasure() == null || parent.getUnitOfMeasure().isBlank()) {
            throw new BusinessRuleException(
                    "PARENT_PACKAGE_INCOMPLETE: Parent product is missing packageUnit");
        }
    }

    private void refreshChildrenCostsIfParent(Product parent) {
        if (parent.getUnitsPerPackage() == null || parent.getUnitsPerPackage().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        List<Product> children = productRepository.findByParentProductId(parent.getId());
        for (Product child : children) {
            String childUnit = child.getUnitOfMeasure() != null
                    ? child.getUnitOfMeasure()
                    : parent.getUnitOfMeasure();
            BigDecimal newCost = ProductPricing.childCostFromParent(
                    parent.getCostPrice(),
                    parent.getUnitsPerPackage(),
                    parent.getUnitOfMeasure(),
                    childUnit
            );
            child.setCostPrice(newCost);
            if (child.getTargetMargin() != null) {
                child.setSellingPrice(ProductPricing.sellingPriceFromMargin(newCost, child.getTargetMargin()));
            }
            productRepository.save(child);
        }
    }

    private BigDecimal resolveCallerStoreDefaultMargin() {
        StoreSettings store = resolveCallerStoreOrNull();
        if (store == null) {
            return null;
        }
        return ProductPricing.readStoreDefaultMargin(store.getPreferences());
    }

    private boolean isCallerInventoryEnabled() {
        StoreSettings store = resolveCallerStoreOrNull();
        if (store == null || store.getFeatures() == null) {
            return false;
        }
        return Boolean.TRUE.equals(store.getFeatures().get("enable_inventory"));
    }

    private StoreSettings resolveCallerStoreOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof PosUserDetails details)) {
            return null;
        }
        return userRepository.findByUsernameIgnoreCase(details.getUsername())
                .map(User::getStore)
                .orElse(null);
    }

    private static BigDecimal resolveCategoryMargin(UUID categoryId, Set<Category> categories) {
        if (categoryId != null) {
            return categories.stream()
                    .filter(c -> c.getId().equals(categoryId))
                    .map(Category::getTargetMargin)
                    .findFirst()
                    .orElse(null);
        }
        return categories.stream()
                .map(Category::getTargetMargin)
                .max(BigDecimal::compareTo)
                .orElse(null);
    }

    private static BigDecimal firstNonNull(BigDecimal... values) {
        for (BigDecimal value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
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
        return codes.stream().filter(c -> c.equalsIgnoreCase(primary)).findFirst().orElse(primary);
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
        BigDecimal storeDefault = resolveCallerStoreDefaultMargin();
        BigDecimal categoryMargin = product.getCategories().stream()
                .map(Category::getTargetMargin)
                .max(BigDecimal::compareTo)
                .orElse(null);
        BigDecimal effective = firstNonNull(product.getTargetMargin(), categoryMargin, storeDefault);

        boolean isParentPackage = product.getUnitsPerPackage() != null
                && product.getUnitsPerPackage().compareTo(BigDecimal.ZERO) > 0
                && product.getParentProduct() == null;

        return new ProductDTO(
                product.getId(),
                primarySku,
                primarySku,
                orderedSkuCodes(product),
                product.getName(),
                product.getDescription(),
                product.getCostPrice(),
                product.getSellingPrice(),
                product.getWholesalePrice() == null
                        ? BigDecimal.ZERO.setScale(MONEY_SCALE)
                        : product.getWholesalePrice(),
                product.getTargetMargin(),
                effective,
                product.getActive(),
                categoryIds,
                Boolean.TRUE.equals(product.getSellByWeight()),
                product.getUnitOfMeasure(),
                product.getParentProduct() != null ? product.getParentProduct().getId() : null,
                isParentPackage ? product.getUnitsPerPackage() : null,
                isParentPackage ? product.getUnitOfMeasure() : null,
                Boolean.TRUE.equals(product.getExcludeFromGlobalDiscounts()),
                Boolean.TRUE.equals(product.getTrackInventory()),
                product.getCurrentStock() == null
                        ? BigDecimal.ZERO.setScale(MONEY_SCALE)
                        : product.getCurrentStock(),
                product.getLowStockThreshold() == null
                        ? BigDecimal.ZERO.setScale(MONEY_SCALE)
                        : product.getLowStockThreshold()
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
}
