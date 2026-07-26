package com.pos.core.repositories;

import com.pos.core.models.Shift;
import com.pos.core.models.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShiftRepository extends JpaRepository<Shift, UUID> {

    Optional<Shift> findFirstByStoreIdAndStatus(UUID storeId, ShiftStatus status);

    boolean existsByStoreIdAndStatus(UUID storeId, ShiftStatus status);

    List<Shift> findByStoreIdOrderByOpenedAtDesc(UUID storeId);

    List<Shift> findByStoreIdAndStatusOrderByOpenedAtDesc(UUID storeId, ShiftStatus status);
}
