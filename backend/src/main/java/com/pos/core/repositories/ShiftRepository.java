package com.pos.core.repositories;

import com.pos.core.models.Shift;
import com.pos.core.models.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    Optional<Shift> findFirstByStoreIdAndStatus(UUID storeId, ShiftStatus status);

    boolean existsByStoreIdAndStatus(UUID storeId, ShiftStatus status);
}
