package com.pos.core.services;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.UpdateStoreSettingsRequest;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.StoreSettingsRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StoreSettingsServiceImplTest {

    @Mock
    private StoreSettingsRepository storeSettingsRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StoreSettingsServiceImpl storeSettingsService;

    private UUID storeId;
    private StoreSettings store;
    private User cashier;

    @BeforeEach
    void setUp() {
        storeId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        store = new StoreSettings();
        store.setId(storeId);
        store.setStoreName("Demo Corner Store");
        store.setFeatures(new HashMap<>(Map.of("enable_inventory", true)));
        store.setPreferences(new HashMap<>());

        cashier = new User();
        cashier.setId(UUID.fromString("00000000-0000-0000-0000-000000000402"));
        cashier.setUsername("cashier");
        cashier.setPasswordHash("hash");
        cashier.setRole(Role.CASHIER);
        cashier.setStore(store);
        cashier.setActive(true);

        var details = new PosUserDetails(cashier);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void stubCaller() {
        when(userRepository.findByUsernameIgnoreCase("cashier")).thenReturn(Optional.of(cashier));
    }

    @Test
    void getSettings_returnsCallerStore() {
        stubCaller();
        when(storeSettingsRepository.findById(storeId)).thenReturn(Optional.of(store));

        var dto = storeSettingsService.getSettings(storeId);

        assertThat(dto.storeId()).isEqualTo(storeId);
        assertThat(dto.storeName()).isEqualTo("Demo Corner Store");
        assertThat(dto.uiLocale()).isEqualTo("en");
        assertThat(dto.features()).containsEntry("enable_inventory", true);
    }

    @Test
    void getSettings_otherStore_returns404() {
        stubCaller();
        UUID other = UUID.fromString("11111111-1111-1111-1111-111111111111");

        assertThatThrownBy(() -> storeSettingsService.getSettings(other))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void patchSettings_mergesUiLocale() {
        stubCaller();
        when(storeSettingsRepository.findById(storeId)).thenReturn(Optional.of(store));
        when(storeSettingsRepository.save(any(StoreSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        var dto = storeSettingsService.patchSettings(
                storeId,
                new UpdateStoreSettingsRequest(null, Map.of("ui_locale", "es"))
        );

        assertThat(dto.uiLocale()).isEqualTo("es");
        assertThat(dto.preferences()).containsEntry("ui_locale", "es");
    }

    @Test
    void patchSettings_rejectsInvalidLocale() {
        stubCaller();
        when(storeSettingsRepository.findById(storeId)).thenReturn(Optional.of(store));

        assertThatThrownBy(() -> storeSettingsService.patchSettings(
                storeId,
                new UpdateStoreSettingsRequest(null, Map.of("ui_locale", "fr"))
        )).isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("ui_locale");
    }

    @Test
    void patchSettings_rejectsUnknownPreferenceKey() {
        stubCaller();
        when(storeSettingsRepository.findById(storeId)).thenReturn(Optional.of(store));

        assertThatThrownBy(() -> storeSettingsService.patchSettings(
                storeId,
                new UpdateStoreSettingsRequest(null, Map.of("tax_rate", 0.16))
        )).isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Unknown preference");
    }

    @Test
    void resolveUiLocale_defaultsWhenMissingOrInvalid() {
        assertThat(StoreSettingsServiceImpl.resolveUiLocale(null)).isEqualTo("en");
        store.setPreferences(Map.of("ui_locale", "nope"));
        assertThat(StoreSettingsServiceImpl.resolveUiLocale(store)).isEqualTo("en");
        store.setPreferences(Map.of("ui_locale", "ES"));
        assertThat(StoreSettingsServiceImpl.resolveUiLocale(store)).isEqualTo("es");
    }
}
