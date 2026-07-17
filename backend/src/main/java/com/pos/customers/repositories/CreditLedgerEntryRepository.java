package com.pos.customers.repositories;

import com.pos.customers.models.CreditLedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CreditLedgerEntryRepository extends JpaRepository<CreditLedgerEntry, UUID> {

    List<CreditLedgerEntry> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}
