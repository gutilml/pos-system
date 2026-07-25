package com.pos.inventory.repositories;

import com.pos.inventory.models.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(UUID productId);
}
