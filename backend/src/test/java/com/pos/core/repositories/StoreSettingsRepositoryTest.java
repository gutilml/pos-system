package com.pos.core.repositories;

import com.pos.core.models.StoreSettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class StoreSettingsRepositoryTest {

    @Autowired
    private StoreSettingsRepository storeSettingsRepository;

    @Test
    void saveAndLoad_persistsFeaturesAsJson() {
        Map<String, Boolean> features = new LinkedHashMap<>();
        features.put("enable_inventory", true);
        features.put("enable_customer_credit", false);

        StoreSettings settings = new StoreSettings();
        settings.setStoreName("Corner Market");
        settings.setFeatures(features);

        StoreSettings saved = storeSettingsRepository.saveAndFlush(settings);

        StoreSettings loaded = storeSettingsRepository.findById(saved.getId()).orElseThrow();

        assertThat(loaded.getStoreName()).isEqualTo("Corner Market");
        assertThat(loaded.getFeatures())
                .containsEntry("enable_inventory", true)
                .containsEntry("enable_customer_credit", false);
        assertThat(loaded.getId()).isNotNull();
        assertThat(loaded.getCreatedAt()).isNotNull();
    }
}
