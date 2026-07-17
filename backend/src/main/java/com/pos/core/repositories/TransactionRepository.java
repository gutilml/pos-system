package com.pos.core.repositories;

import com.pos.core.models.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
            SELECT COALESCE(SUM(t.grandTotal), 0)
            FROM Transaction t
            WHERE t.shift.id = :shiftId
            """)
    BigDecimal sumGrandTotalByShiftId(@Param("shiftId") UUID shiftId);
}
