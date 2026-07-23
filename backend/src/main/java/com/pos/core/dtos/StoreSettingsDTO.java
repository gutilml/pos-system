package com.pos.core.dtos;

import java.util.Map;
import java.util.UUID;

public record StoreSettingsDTO(
        UUID storeId,
        String storeName,
        Map<String, Boolean> features,
        Map<String, Object> preferences,
        String uiLocale
) {
}
