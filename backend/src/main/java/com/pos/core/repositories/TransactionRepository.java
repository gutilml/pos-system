package com.pos.core.repositories;

import com.pos.core.models.PaymentType;
import com.pos.core.models.Transaction;
import com.pos.core.models.TransactionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    List<Transaction> findByStoreIdAndStatusOrderByCreatedAtDesc(UUID storeId, TransactionStatus status);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Transaction t SET t.customer = null WHERE t.customer.id = :customerId")
    int clearCustomerReference(@Param("customerId") UUID customerId);

    @Query("""
            SELECT COALESCE(SUM(t.grandTotal), 0)
            FROM Transaction t
            WHERE t.shift.id = :shiftId
              AND t.status = com.pos.core.models.TransactionStatus.COMPLETED
            """)
    BigDecimal sumGrandTotalByShiftId(@Param("shiftId") UUID shiftId);

    @Query("""
            SELECT COALESCE(SUM(p.amount), 0)
            FROM TransactionPayment p
            WHERE p.transaction.shift.id = :shiftId
              AND p.transaction.status = com.pos.core.models.TransactionStatus.COMPLETED
              AND p.paymentMethod = :method
            """)
    BigDecimal sumPaymentAmountByShiftIdAndMethod(
            @Param("shiftId") UUID shiftId,
            @Param("method") PaymentType method
    );

    @Query("""
            SELECT COALESCE(SUM(t.changeGiven), 0)
            FROM Transaction t
            WHERE t.shift.id = :shiftId
              AND t.status = com.pos.core.models.TransactionStatus.COMPLETED
            """)
    BigDecimal sumChangeGivenByShiftId(@Param("shiftId") UUID shiftId);
}
