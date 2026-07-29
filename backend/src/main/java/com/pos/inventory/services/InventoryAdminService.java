package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.inventory.dtos.InventoryProductDTO;
import com.pos.inventory.dtos.StockMovementDTO;
import com.pos.inventory.dtos.StockMovementRequestDTO;
import com.pos.inventory.models.StockMovement;
import com.pos.inventory.models.StockMovementType;
import com.pos.inventory.repositories.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class InventoryAdminService {

    public static final String FEATURE_ENABLE_INVENTORY = "enable_inventory";
    public static final int SCALE = 4;
    public static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final ProductRepository productRepository;
    private final StoreSettingsRepository storeSettingsRepository;
    private final StockMovementRepository stockMovementRepository;

    public InventoryAdminService(
            ProductRepository productRepository,
            StoreSettingsRepository storeSettingsRepository,
            StockMovementRepository stockMovementRepository
    ) {
        this.productRepository = productRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional(readOnly = true)
    public List<InventoryProductDTO> listProducts(UUID storeId, String query, boolean lowStockOnly) {
        requireStore(storeId);
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        List<InventoryProductDTO> rows = new ArrayList<>();
        for (Product product : productRepository.findAll()) {
            if (!Boolean.TRUE.equals(product.getActive())) {
                continue;
            }
            Product stocked = resolveStockedProduct(product);
            if (stocked == null || !Boolean.TRUE.equals(stocked.getTrackInventory())) {
                continue;
            }
            if (!q.isEmpty()) {
                String name = product.getName() == null ? "" : product.getName().toLowerCase(Locale.ROOT);
                boolean skuHit = product.getSkus() != null && product.getSkus().stream()
                        .map(sku -> sku.getCode())
                        .filter(code -> code != null && !code.isBlank())
                        .anyMatch(code -> code.toLowerCase(Locale.ROOT).contains(q));
                if (!name.contains(q) && !skuHit) {
                    continue;
                }
            }
            InventoryProductDTO dto = toInventoryDto(product, stocked);
            if (lowStockOnly && !dto.lowStock()) {
                continue;
            }
            rows.add(dto);
        }
        rows.sort((a, b) -> a.name().compareToIgnoreCase(b.name()));
        return rows;
    }

    @Transactional(readOnly = true)
    public List<StockMovementDTO> listMovements(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
        Product stocked = resolveStockedProduct(product);
        if (stocked == null) {
            throw new BusinessRuleException("Product does not participate in inventory");
        }
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(stocked.getId()).stream()
                .map(this::toMovementDto)
                .toList();
    }

    public StockMovementDTO createMovement(StockMovementRequestDTO request) {
        StoreSettings store = requireStore(request.storeId());
        requireInventoryEnabled(store);

        if (request.type() == StockMovementType.SALE || request.type() == StockMovementType.RETURN) {
            throw new BusinessRuleException("SALE and RETURN movements are created by checkout/reimburse only");
        }

        Product requested = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.productId()));
        Product stocked = resolveStockedProduct(requested);
        if (stocked == null || !Boolean.TRUE.equals(stocked.getTrackInventory())) {
            throw new BusinessRuleException("Product does not track inventory");
        }

        BigDecimal qty = scale(request.quantity());
        BigDecimal qtyBefore = stockOrZero(stocked);
        BigDecimal delta;
        if (request.type() == StockMovementType.RECEIVING) {
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessRuleException("Receiving quantity must be greater than zero");
            }
            delta = qty;
        } else if (request.type() == StockMovementType.ADJUSTMENT) {
            if (request.reason() == null || request.reason().isBlank()) {
                throw new BusinessRuleException("reason is required for ADJUSTMENT");
            }
            if (qty.compareTo(BigDecimal.ZERO) == 0) {
                throw new BusinessRuleException("Adjustment quantity delta cannot be zero");
            }
            delta = qty;
            BigDecimal after = qtyBefore.add(delta);
            if (after.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessRuleException(
                        "Adjustment would make stock negative: have " + qtyBefore + ", delta " + delta);
            }
        } else {
            throw new BusinessRuleException("Unsupported movement type: " + request.type());
        }

        BigDecimal costBefore = moneyOrZero(stocked.getCostPrice());
        BigDecimal sellingBefore = moneyOrZero(stocked.getSellingPrice());
        BigDecimal wholesaleBefore = moneyOrZero(stocked.getWholesalePrice());

        BigDecimal costAfter = costBefore;
        BigDecimal sellingAfter = sellingBefore;
        BigDecimal wholesaleAfter = wholesaleBefore;

        if (request.type() == StockMovementType.RECEIVING
                && request.unitCost() != null
                && scale(request.unitCost()).compareTo(costBefore) != 0) {
            BigDecimal newCost = scale(request.unitCost());
            BigDecimal incomingSelling = request.sellingPrice() != null
                    ? scale(request.sellingPrice())
                    : deriveIncomingPrice(newCost, stocked.getTargetMargin());
            BigDecimal incomingWholesale = request.wholesalePrice() != null
                    ? scale(request.wholesalePrice())
                    : deriveIncomingPrice(newCost, stocked.getWholesaleMargin());

            costAfter = weightedAverage(costBefore, qtyBefore, newCost, delta);
            sellingAfter = weightedAverage(sellingBefore, qtyBefore, incomingSelling, delta);
            wholesaleAfter = weightedAverage(wholesaleBefore, qtyBefore, incomingWholesale, delta);

            stocked.setCostPrice(costAfter);
            stocked.setSellingPrice(sellingAfter);
            stocked.setWholesalePrice(wholesaleAfter);
            stocked.setTargetMargin(safeMargin(costAfter, sellingAfter));
            stocked.setWholesaleMargin(safeMargin(costAfter, wholesaleAfter));
        } else if (request.type() == StockMovementType.RECEIVING
                && request.sellingPrice() != null
                && request.unitCost() != null
                && scale(request.unitCost()).compareTo(costBefore) == 0) {
            // cost unchanged → no price rewrite (even if overrides sent)
        }

        BigDecimal qtyAfter = qtyBefore.add(delta).setScale(SCALE, ROUNDING);
        stocked.setCurrentStock(qtyAfter);
        productRepository.save(stocked);

        StockMovement movement = new StockMovement();
        movement.setStore(store);
        movement.setProduct(stocked);
        movement.setType(request.type());
        movement.setQuantityDelta(delta);
        movement.setQuantityAfter(qtyAfter);
        movement.setUnitCostBefore(costBefore);
        movement.setUnitCostAfter(moneyOrZero(stocked.getCostPrice()));
        movement.setSellingBefore(sellingBefore);
        movement.setSellingAfter(moneyOrZero(stocked.getSellingPrice()));
        movement.setWholesaleBefore(wholesaleBefore);
        movement.setWholesaleAfter(moneyOrZero(stocked.getWholesalePrice()));
        movement.setReason(request.reason() != null && !request.reason().isBlank()
                ? request.reason().trim()
                : null);
        return toMovementDto(stockMovementRepository.save(movement));
    }

    public static BigDecimal weightedAverage(
            BigDecimal oldValue,
            BigDecimal qtyBefore,
            BigDecimal incomingValue,
            BigDecimal incomingQty
    ) {
        BigDecimal totalQty = qtyBefore.add(incomingQty);
        if (totalQty.compareTo(BigDecimal.ZERO) <= 0) {
            return scale(incomingValue);
        }
        BigDecimal numerator = oldValue.multiply(qtyBefore).add(incomingValue.multiply(incomingQty));
        return numerator.divide(totalQty, SCALE, ROUNDING);
    }

    public static BigDecimal computeWholesaleMargin(BigDecimal cost, BigDecimal wholesale) {
        return safeMargin(cost, wholesale);
    }

    private static BigDecimal deriveIncomingPrice(BigDecimal cost, BigDecimal margin) {
        if (margin == null) {
            return scale(cost);
        }
        return ProductPricing.sellingPriceFromMargin(cost, margin);
    }

    private static BigDecimal safeMargin(BigDecimal cost, BigDecimal price) {
        if (cost == null || price == null) {
            return null;
        }
        if (cost.compareTo(BigDecimal.ZERO) <= 0 || price.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        if (cost.compareTo(price) > 0) {
            return null;
        }
        try {
            return ProductPricing.marginFromCostAndPrice(cost, price);
        } catch (BusinessRuleException ex) {
            return null;
        }
    }

    private Product resolveStockedProduct(Product product) {
        if (product.getParentProduct() != null) {
            Product parent = product.getParentProduct().getId() != null
                    ? productRepository.findById(product.getParentProduct().getId()).orElse(null)
                    : product.getParentProduct();
            return parent;
        }
        return product;
    }

    private InventoryProductDTO toInventoryDto(Product product, Product stocked) {
        BigDecimal stock = stockOrZero(stocked);
        BigDecimal threshold = stocked.getLowStockThreshold() == null
                ? BigDecimal.ZERO.setScale(SCALE, ROUNDING)
                : stocked.getLowStockThreshold().setScale(SCALE, ROUNDING);
        boolean low = stock.compareTo(threshold) <= 0;
        return new InventoryProductDTO(
                product.getId(),
                product.getName(),
                product.resolvePrimarySku(),
                stocked.getId(),
                product.getParentProduct() != null ? product.getParentProduct().getId() : null,
                Boolean.TRUE.equals(stocked.getTrackInventory()),
                stock,
                threshold,
                low,
                moneyOrZero(stocked.getCostPrice()),
                moneyOrZero(stocked.getSellingPrice()),
                moneyOrZero(stocked.getWholesalePrice()),
                stocked.getTargetMargin(),
                stocked.getWholesaleMargin()
        );
    }

    private StockMovementDTO toMovementDto(StockMovement movement) {
        return new StockMovementDTO(
                movement.getId(),
                movement.getStore().getId(),
                movement.getProduct().getId(),
                movement.getType(),
                movement.getQuantityDelta(),
                movement.getQuantityAfter(),
                movement.getUnitCostBefore(),
                movement.getUnitCostAfter(),
                movement.getSellingBefore(),
                movement.getSellingAfter(),
                movement.getWholesaleBefore(),
                movement.getWholesaleAfter(),
                movement.getReason(),
                movement.getCreatedAt()
        );
    }

    private StoreSettings requireStore(UUID storeId) {
        return storeSettingsRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));
    }

    private void requireInventoryEnabled(StoreSettings store) {
        if (store.getFeatures() == null || !Boolean.TRUE.equals(store.getFeatures().get(FEATURE_ENABLE_INVENTORY))) {
            throw new BusinessRuleException("Inventory is not enabled for this store");
        }
    }

    private static BigDecimal stockOrZero(Product product) {
        return product.getCurrentStock() == null
                ? BigDecimal.ZERO.setScale(SCALE, ROUNDING)
                : product.getCurrentStock().setScale(SCALE, ROUNDING);
    }

    private static BigDecimal moneyOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(SCALE, ROUNDING) : value.setScale(SCALE, ROUNDING);
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(SCALE, ROUNDING);
    }
}
