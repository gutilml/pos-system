package com.pos.core.controllers;

import com.pos.core.dtos.StoreSettingsDTO;
import com.pos.core.dtos.UpdateStoreSettingsRequest;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.services.StoreSettingsService;
import com.pos.testsupport.UnsecuredWebMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = StoreSettingsController.class)
@Import(GlobalExceptionHandler.class)
class StoreSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StoreSettingsService storeSettingsService;

    @Test
    void getSettings_returns200() throws Exception {
        UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(storeSettingsService.getSettings(storeId)).thenReturn(new StoreSettingsDTO(
                storeId,
                "Demo Corner Store",
                Map.of("enable_inventory", true),
                Map.of("ui_locale", "en"),
                "en"
        ));

        mockMvc.perform(get("/api/v1/stores/{storeId}/settings", storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.storeId").value(storeId.toString()))
                .andExpect(jsonPath("$.storeName").value("Demo Corner Store"))
                .andExpect(jsonPath("$.uiLocale").value("en"))
                .andExpect(jsonPath("$.preferences.ui_locale").value("en"));
    }

    @Test
    void patchSettings_returnsUpdatedLocale() throws Exception {
        UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(storeSettingsService.patchSettings(eq(storeId), any(UpdateStoreSettingsRequest.class)))
                .thenReturn(new StoreSettingsDTO(
                        storeId,
                        "Demo Corner Store",
                        Map.of(),
                        Map.of("ui_locale", "es"),
                        "es"
                ));

        mockMvc.perform(patch("/api/v1/stores/{storeId}/settings", storeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"preferences":{"ui_locale":"es"}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uiLocale").value("es"));
    }

    @Test
    void getSettings_otherStore_returns404() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        when(storeSettingsService.getSettings(storeId))
                .thenThrow(new ResourceNotFoundException("Store not found: " + storeId));

        mockMvc.perform(get("/api/v1/stores/{storeId}/settings", storeId))
                .andExpect(status().isNotFound());
    }

    @Test
    void patchSettings_invalidLocale_returns400() throws Exception {
        UUID storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        when(storeSettingsService.patchSettings(eq(storeId), any(UpdateStoreSettingsRequest.class)))
                .thenThrow(new BusinessRuleException("ui_locale must be en or es"));

        mockMvc.perform(patch("/api/v1/stores/{storeId}/settings", storeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"preferences":{"ui_locale":"fr"}}
                                """))
                .andExpect(status().isBadRequest());
    }
}
