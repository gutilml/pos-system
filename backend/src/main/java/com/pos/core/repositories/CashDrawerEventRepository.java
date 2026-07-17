package com.pos.core.repositories;

import com.pos.core.models.CashDrawerEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CashDrawerEventRepository extends JpaRepository<CashDrawerEvent, UUID> {
}
