package com.pos.core.repositories;

import com.pos.core.models.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransactionItemRepository extends JpaRepository<TransactionItem, UUID> {
}
