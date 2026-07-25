package com.pos.inventory.services;

import com.pos.core.models.TransactionItem;

import java.util.List;

public interface InventoryService {

    /**
     * Deducts stock for sold line items using BigDecimal math.
     * Handles standard/weight deductions and parent-package yield for individual units.
     */
    void deductStock(List<TransactionItem> items);

    /**
     * Restores stock for returned line items (Feature 072). Mirrors {@link #deductStock}
     * with positive deltas and {@code StockMovementType.RETURN}.
     */
    void restoreStock(List<TransactionItem> items);
}
