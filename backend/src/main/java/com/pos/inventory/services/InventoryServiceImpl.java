package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import com.pos.core.models.TransactionItem;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.ProductRepository;
import com.pos.inventory.models.StockMovement;
import com.pos.inventory.models.StockMovementType;
import com.pos.inventory.repositories.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    public static final int STOCK_SCALE = 4;
    public static final RoundingMode STOCK_ROUNDING = RoundingMode.HALF_UP;

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public InventoryServiceImpl(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository
    ) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    public void deductStock(List<TransactionItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        for (TransactionItem item : items) {
            if (item.getProduct() == null || item.getQuantity() == null) {
                continue;
            }

            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + item.getProduct().getId()));

            BigDecimal quantity = item.getQuantity().setScale(STOCK_SCALE, STOCK_ROUNDING);
            StoreSettings store = item.getTransaction() != null ? item.getTransaction().getStore() : null;

            if (product.getParentProduct() != null) {
                deductParentPackage(product, quantity, store);
            } else if (Boolean.TRUE.equals(product.getTrackInventory())) {
                deductFromProduct(product, quantity, store);
            }
        }
    }

    @Override
    public void restoreStock(List<TransactionItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        for (TransactionItem item : items) {
            if (item.getProduct() == null || item.getQuantity() == null) {
                continue;
            }

            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found: " + item.getProduct().getId()));

            BigDecimal quantity = item.getQuantity().setScale(STOCK_SCALE, STOCK_ROUNDING);
            StoreSettings store = item.getTransaction() != null ? item.getTransaction().getStore() : null;

            if (product.getParentProduct() != null) {
                restoreParentPackage(product, quantity, store);
            } else if (Boolean.TRUE.equals(product.getTrackInventory())) {
                restoreToProduct(product, quantity, store);
            }
        }
    }

    /**
     * Parent stock is in packages: Δ = −(soldQtyInParentUnit ÷ parent.qtyPerPackage).
     */
    BigDecimal calculateParentPackageDeduction(BigDecimal soldQtyInParentUnit, BigDecimal qtyPerPackage) {
        if (qtyPerPackage == null || qtyPerPackage.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Parent qtyPerPackage must be greater than zero");
        }
        return soldQtyInParentUnit.divide(qtyPerPackage, STOCK_SCALE, STOCK_ROUNDING);
    }

    /** @deprecated Feature 052 — use {@link #calculateParentPackageDeduction} */
    BigDecimal calculateYieldDeduction(BigDecimal quantitySold, BigDecimal unitsPerPackage) {
        return calculateParentPackageDeduction(quantitySold, unitsPerPackage);
    }

    private void deductParentPackage(Product child, BigDecimal quantitySold, StoreSettings store) {
        Product parent = productRepository.findById(child.getParentProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parent product not found: " + child.getParentProduct().getId()));

        if (!Boolean.TRUE.equals(parent.getTrackInventory())) {
            return;
        }
        if (parent.getUnitsPerPackage() == null || parent.getUnitsPerPackage().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Parent product is missing qtyPerPackage for stock deduction");
        }
        if (parent.getUnitOfMeasure() == null || parent.getUnitOfMeasure().isBlank()) {
            throw new BusinessRuleException("Parent product is missing packageUnit for stock deduction");
        }

        String childUnit = child.getUnitOfMeasure() != null ? child.getUnitOfMeasure() : parent.getUnitOfMeasure();
        BigDecimal soldInParentUnit = ProductPricing.convertQuantity(
                quantitySold, childUnit, parent.getUnitOfMeasure());
        BigDecimal deduction = calculateParentPackageDeduction(soldInParentUnit, parent.getUnitsPerPackage());
        applySaleDeduction(parent, deduction, store);
        productRepository.save(parent);
    }

    private void restoreParentPackage(Product child, BigDecimal quantityReturned, StoreSettings store) {
        Product parent = productRepository.findById(child.getParentProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parent product not found: " + child.getParentProduct().getId()));

        if (!Boolean.TRUE.equals(parent.getTrackInventory())) {
            return;
        }
        if (parent.getUnitsPerPackage() == null || parent.getUnitsPerPackage().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("Parent product is missing qtyPerPackage for stock restore");
        }
        if (parent.getUnitOfMeasure() == null || parent.getUnitOfMeasure().isBlank()) {
            throw new BusinessRuleException("Parent product is missing packageUnit for stock restore");
        }

        String childUnit = child.getUnitOfMeasure() != null ? child.getUnitOfMeasure() : parent.getUnitOfMeasure();
        BigDecimal returnedInParentUnit = ProductPricing.convertQuantity(
                quantityReturned, childUnit, parent.getUnitOfMeasure());
        BigDecimal restoration = calculateParentPackageDeduction(returnedInParentUnit, parent.getUnitsPerPackage());
        applyReturnRestoration(parent, restoration, store);
        productRepository.save(parent);
    }

    private void deductFromProduct(Product product, BigDecimal quantity, StoreSettings store) {
        applySaleDeduction(product, quantity, store);
        productRepository.save(product);
    }

    private void restoreToProduct(Product product, BigDecimal quantity, StoreSettings store) {
        applyReturnRestoration(product, quantity, store);
        productRepository.save(product);
    }

    /** Feature 062: sales may drive stock negative; always record a SALE movement when store is known. */
    private void applySaleDeduction(Product product, BigDecimal deduction, StoreSettings store) {
        BigDecimal current = product.getCurrentStock() != null
                ? product.getCurrentStock()
                : BigDecimal.ZERO.setScale(STOCK_SCALE, STOCK_ROUNDING);
        BigDecimal next = current.subtract(deduction).setScale(STOCK_SCALE, STOCK_ROUNDING);
        product.setCurrentStock(next);

        if (store != null) {
            StockMovement movement = new StockMovement();
            movement.setStore(store);
            movement.setProduct(product);
            movement.setType(StockMovementType.SALE);
            movement.setQuantityDelta(deduction.negate());
            movement.setQuantityAfter(next);
            movement.setUnitCostBefore(product.getCostPrice());
            movement.setUnitCostAfter(product.getCostPrice());
            movement.setSellingBefore(product.getSellingPrice());
            movement.setSellingAfter(product.getSellingPrice());
            movement.setWholesaleBefore(product.getWholesalePrice());
            movement.setWholesaleAfter(product.getWholesalePrice());
            movement.setReason(null);
            stockMovementRepository.save(movement);
        }
    }

    /** Feature 072: reverse of sale deduction with RETURN movement and positive quantityDelta. */
    private void applyReturnRestoration(Product product, BigDecimal restoration, StoreSettings store) {
        BigDecimal current = product.getCurrentStock() != null
                ? product.getCurrentStock()
                : BigDecimal.ZERO.setScale(STOCK_SCALE, STOCK_ROUNDING);
        BigDecimal next = current.add(restoration).setScale(STOCK_SCALE, STOCK_ROUNDING);
        product.setCurrentStock(next);

        if (store != null) {
            StockMovement movement = new StockMovement();
            movement.setStore(store);
            movement.setProduct(product);
            movement.setType(StockMovementType.RETURN);
            movement.setQuantityDelta(restoration);
            movement.setQuantityAfter(next);
            movement.setUnitCostBefore(product.getCostPrice());
            movement.setUnitCostAfter(product.getCostPrice());
            movement.setSellingBefore(product.getSellingPrice());
            movement.setSellingAfter(product.getSellingPrice());
            movement.setWholesaleBefore(product.getWholesalePrice());
            movement.setWholesaleAfter(product.getWholesalePrice());
            movement.setReason(null);
            stockMovementRepository.save(movement);
        }
    }
}
