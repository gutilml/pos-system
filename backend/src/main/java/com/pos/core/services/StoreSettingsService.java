package com.pos.core.services;

import com.pos.core.dtos.StoreSettingsDTO;
import com.pos.core.dtos.UpdateStoreSettingsRequest;

import java.util.UUID;

public interface StoreSettingsService {

    StoreSettingsDTO getSettings(UUID storeId);

    StoreSettingsDTO patchSettings(UUID storeId, UpdateStoreSettingsRequest request);
}
