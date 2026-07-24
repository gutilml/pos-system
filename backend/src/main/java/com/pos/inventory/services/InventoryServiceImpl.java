package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Product;
import com.pos.core.models.TransactionItem;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.ProductRepository;
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

    public InventoryServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
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

            if (product.getParentProduct() != null) {
                deductParentPackage(product, quantity);
            } else if (Boolean.TRUE.equals(product.getTrackInventory())) {
                deductFromProduct(product, quantity);
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

    private void deductParentPackage(Product child, BigDecimal quantitySold) {
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
        applyDeduction(parent, deduction, true);
        productRepository.save(parent);
    }

    private void deductFromProduct(Product product, BigDecimal quantity) {
        applyDeduction(product, quantity, true);
        productRepository.save(product);
    }

    private void applyDeduction(Product product, BigDecimal deduction, boolean rejectInsufficient) {
        BigDecimal current = product.getCurrentStock() != null
                ? product.getCurrentStock()
                : BigDecimal.ZERO.setScale(STOCK_SCALE, STOCK_ROUNDING);
        BigDecimal next = current.subtract(deduction).setScale(STOCK_SCALE, STOCK_ROUNDING);
        if (rejectInsufficient && next.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException(
                    "Insufficient stock for product " + product.getId() + ": have " + current + ", need " + deduction);
        }
        product.setCurrentStock(next);
    }
}
