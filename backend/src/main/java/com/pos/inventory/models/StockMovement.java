package com.pos.inventory.models;

import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private StoreSettings store;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private StockMovementType type;

    @Column(name = "quantity_delta", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityDelta;

    @Column(name = "quantity_after", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityAfter;

    @Column(name = "unit_cost_before", precision = 12, scale = 4)
    private BigDecimal unitCostBefore;

    @Column(name = "unit_cost_after", precision = 12, scale = 4)
    private BigDecimal unitCostAfter;

    @Column(name = "selling_before", precision = 12, scale = 4)
    private BigDecimal sellingBefore;

    @Column(name = "selling_after", precision = 12, scale = 4)
    private BigDecimal sellingAfter;

    @Column(name = "wholesale_before", precision = 12, scale = 4)
    private BigDecimal wholesaleBefore;

    @Column(name = "wholesale_after", precision = 12, scale = 4)
    private BigDecimal wholesaleAfter;

    @Column(name = "reason", length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public StoreSettings getStore() {
        return store;
    }

    public void setStore(StoreSettings store) {
        this.store = store;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public StockMovementType getType() {
        return type;
    }

    public void setType(StockMovementType type) {
        this.type = type;
    }

    public BigDecimal getQuantityDelta() {
        return quantityDelta;
    }

    public void setQuantityDelta(BigDecimal quantityDelta) {
        this.quantityDelta = quantityDelta;
    }

    public BigDecimal getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(BigDecimal quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public BigDecimal getUnitCostBefore() {
        return unitCostBefore;
    }

    public void setUnitCostBefore(BigDecimal unitCostBefore) {
        this.unitCostBefore = unitCostBefore;
    }

    public BigDecimal getUnitCostAfter() {
        return unitCostAfter;
    }

    public void setUnitCostAfter(BigDecimal unitCostAfter) {
        this.unitCostAfter = unitCostAfter;
    }

    public BigDecimal getSellingBefore() {
        return sellingBefore;
    }

    public void setSellingBefore(BigDecimal sellingBefore) {
        this.sellingBefore = sellingBefore;
    }

    public BigDecimal getSellingAfter() {
        return sellingAfter;
    }

    public void setSellingAfter(BigDecimal sellingAfter) {
        this.sellingAfter = sellingAfter;
    }

    public BigDecimal getWholesaleBefore() {
        return wholesaleBefore;
    }

    public void setWholesaleBefore(BigDecimal wholesaleBefore) {
        this.wholesaleBefore = wholesaleBefore;
    }

    public BigDecimal getWholesaleAfter() {
        return wholesaleAfter;
    }

    public void setWholesaleAfter(BigDecimal wholesaleAfter) {
        this.wholesaleAfter = wholesaleAfter;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
