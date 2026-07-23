package com.pos.core.controllers;

import com.pos.core.dtos.StoreSettingsDTO;
import com.pos.core.dtos.UpdateStoreSettingsRequest;
import com.pos.core.services.StoreSettingsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreSettingsController {

    private final StoreSettingsService storeSettingsService;

    public StoreSettingsController(StoreSettingsService storeSettingsService) {
        this.storeSettingsService = storeSettingsService;
    }

    @GetMapping("/{storeId}/settings")
    public StoreSettingsDTO getSettings(@PathVariable UUID storeId) {
        return storeSettingsService.getSettings(storeId);
    }

    @PatchMapping("/{storeId}/settings")
    public StoreSettingsDTO patchSettings(
            @PathVariable UUID storeId,
            @RequestBody(required = false) UpdateStoreSettingsRequest request
    ) {
        return storeSettingsService.patchSettings(storeId, request);
    }
}
