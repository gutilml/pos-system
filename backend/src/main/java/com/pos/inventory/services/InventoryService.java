package com.pos.inventory.services;

import com.pos.core.models.TransactionItem;

import java.util.List;

public interface InventoryService {

    /**
     * Deducts stock for sold line items using BigDecimal math.
     * Handles standard/weight deductions and parent-package yield for individual units.
     */
    void deductStock(List<TransactionItem> items);
}
