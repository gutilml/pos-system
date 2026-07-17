package com.pos.inventory.services;

import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.Product;
import com.pos.core.models.TransactionItem;
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

            if (isYieldDeduction(product)) {
                deductParentYield(product, quantity);
            } else {
                deductFromProduct(product, quantity);
            }
        }
    }

    /**
     * Individual child units deduct a fractional share of the parent package.
     * Example: 1 can from a 24-pack → parent loses 1/24 = 0.0417 (HALF_UP, scale 4).
     */
    BigDecimal calculateYieldDeduction(BigDecimal quantitySold, BigDecimal unitsPerPackage) {
        if (unitsPerPackage == null || unitsPerPackage.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessRuleException("unitsPerPackage must be greater than zero for yield deduction");
        }

        BigDecimal fractionPerUnit = BigDecimal.ONE.divide(unitsPerPackage, STOCK_SCALE, STOCK_ROUNDING);
        return quantitySold.multiply(fractionPerUnit).setScale(STOCK_SCALE, STOCK_ROUNDING);
    }

    private boolean isYieldDeduction(Product product) {
        return Boolean.TRUE.equals(product.getIndividualUnit())
                && product.getParentProduct() != null
                && product.getUnitsPerPackage() != null
                && product.getUnitsPerPackage().compareTo(BigDecimal.ZERO) > 0;
    }

    private void deductParentYield(Product child, BigDecimal quantitySold) {
        Product parent = productRepository.findById(child.getParentProduct().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Parent product not found: " + child.getParentProduct().getId()));

        BigDecimal deduction = calculateYieldDeduction(quantitySold, child.getUnitsPerPackage());
        applyDeduction(parent, deduction);
        productRepository.save(parent);
    }

    private void deductFromProduct(Product product, BigDecimal quantity) {
        applyDeduction(product, quantity);
        productRepository.save(product);
    }

    private void applyDeduction(Product product, BigDecimal deduction) {
        BigDecimal current = product.getCurrentStock() != null
                ? product.getCurrentStock()
                : BigDecimal.ZERO.setScale(STOCK_SCALE, STOCK_ROUNDING);

        product.setCurrentStock(current.subtract(deduction).setScale(STOCK_SCALE, STOCK_ROUNDING));
    }
}
