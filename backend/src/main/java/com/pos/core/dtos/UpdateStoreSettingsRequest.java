package com.pos.core.dtos;

import java.util.Map;

public record UpdateStoreSettingsRequest(
        Map<String, Boolean> features,
        Map<String, Object> preferences
) {
}
