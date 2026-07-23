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
        assertThat(loaded.getPreferences()).isEmpty();
        assertThat(loaded.getId()).isNotNull();
        assertThat(loaded.getCreatedAt()).isNotNull();
    }

    @Test
    void saveAndLoad_persistsPreferencesAsJson() {
        StoreSettings settings = new StoreSettings();
        settings.setStoreName("Corner Market");
        settings.setFeatures(Map.of("enable_inventory", false));
        settings.setPreferences(Map.of("ui_locale", "es"));

        StoreSettings saved = storeSettingsRepository.saveAndFlush(settings);
        StoreSettings loaded = storeSettingsRepository.findById(saved.getId()).orElseThrow();

        assertThat(loaded.getPreferences()).containsEntry("ui_locale", "es");
    }
}
