package com.pos.core.repositories;

import com.pos.core.models.StoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StoreSettingsRepository extends JpaRepository<StoreSettings, UUID> {
}
