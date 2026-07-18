package com.pos.customers.repositories;

import com.pos.customers.models.Customer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    @Query("""
            SELECT c FROM Customer c
            WHERE c.store.id = :storeId
              AND (
                   LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%'))
                OR (c.phone IS NOT NULL AND LOWER(c.phone) LIKE LOWER(CONCAT('%', :q, '%')))
              )
            ORDER BY c.name ASC
            """)
    List<Customer> searchByStoreAndQuery(
            @Param("storeId") UUID storeId,
            @Param("q") String q,
            Pageable pageable
    );
}
