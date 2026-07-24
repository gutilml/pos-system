package com.pos.core.services;

import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.StoreSettingsDTO;
import com.pos.core.dtos.UpdateStoreSettingsRequest;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.StoreSettings;
import com.pos.core.pricing.ProductPricing;
import com.pos.core.repositories.StoreSettingsRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class StoreSettingsServiceImpl implements StoreSettingsService {

    public static final String PREF_UI_LOCALE = "ui_locale";
    public static final String PREF_DEFAULT_MARGIN = "default_margin";
    public static final String DEFAULT_UI_LOCALE = "en";
    private static final Set<String> ALLOWED_UI_LOCALES = Set.of("en", "es");
    private static final Set<String> ALLOWED_PREFERENCE_KEYS = Set.of(PREF_UI_LOCALE, PREF_DEFAULT_MARGIN);

    private final StoreSettingsRepository storeSettingsRepository;
    private final UserRepository userRepository;

    public StoreSettingsServiceImpl(
            StoreSettingsRepository storeSettingsRepository,
            UserRepository userRepository
    ) {
        this.storeSettingsRepository = storeSettingsRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public StoreSettingsDTO getSettings(UUID storeId) {
        StoreSettings store = requireCallerStore(storeId);
        return toDto(store);
    }

    @Override
    @Transactional
    public StoreSettingsDTO patchSettings(UUID storeId, UpdateStoreSettingsRequest request) {
        StoreSettings store = requireCallerStore(storeId);
        if (request == null) {
            return toDto(store);
        }

        if (request.features() != null) {
            Map<String, Boolean> features = store.getFeatures() == null
                    ? new HashMap<>()
                    : new HashMap<>(store.getFeatures());
            features.putAll(request.features());
            store.setFeatures(features);
        }

        if (request.preferences() != null) {
            Map<String, Object> preferences = store.getPreferences() == null
                    ? new LinkedHashMap<>()
                    : new LinkedHashMap<>(store.getPreferences());
            for (Map.Entry<String, Object> entry : request.preferences().entrySet()) {
                String key = entry.getKey();
                if (!ALLOWED_PREFERENCE_KEYS.contains(key)) {
                    throw new BusinessRuleException("Unknown preference key: " + key);
                }
                if (PREF_UI_LOCALE.equals(key)) {
                    preferences.put(key, normalizeUiLocale(entry.getValue()));
                } else if (PREF_DEFAULT_MARGIN.equals(key)) {
                    preferences.put(key, ProductPricing.readStoreDefaultMargin(
                            Map.of(PREF_DEFAULT_MARGIN, entry.getValue())));
                }
            }
            store.setPreferences(preferences);
        }

        return toDto(storeSettingsRepository.save(store));
    }

    private StoreSettings requireCallerStore(UUID storeId) {
        User caller = requireCurrentUser();
        var callerStore = caller.getStore();
        if (callerStore == null || callerStore.getId() == null || !callerStore.getId().equals(storeId)) {
            throw new ResourceNotFoundException("Store not found: " + storeId);
        }
        return storeSettingsRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + storeId));
    }

    private User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof PosUserDetails details)) {
            throw new BadCredentialsException("Not authenticated");
        }
        User user = userRepository.findByUsernameIgnoreCase(details.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Not authenticated"));
        if (!user.isActive()) {
            throw new BadCredentialsException("Not authenticated");
        }
        return user;
    }

    static StoreSettingsDTO toDto(StoreSettings store) {
        Map<String, Boolean> features = store.getFeatures() == null
                ? Map.of()
                : Map.copyOf(store.getFeatures());
        Map<String, Object> preferences = store.getPreferences() == null
                ? Map.of()
                : Map.copyOf(store.getPreferences());
        return new StoreSettingsDTO(
                store.getId(),
                store.getStoreName(),
                features,
                preferences,
                resolveUiLocale(store)
        );
    }

    public static String resolveUiLocale(StoreSettings store) {
        if (store == null || store.getPreferences() == null) {
            return DEFAULT_UI_LOCALE;
        }
        Object raw = store.getPreferences().get(PREF_UI_LOCALE);
        if (raw == null) {
            return DEFAULT_UI_LOCALE;
        }
        String value = String.valueOf(raw).trim().toLowerCase();
        return ALLOWED_UI_LOCALES.contains(value) ? value : DEFAULT_UI_LOCALE;
    }

    private static String normalizeUiLocale(Object raw) {
        if (raw == null) {
            throw new BusinessRuleException("ui_locale is required");
        }
        String value = String.valueOf(raw).trim().toLowerCase();
        if (!ALLOWED_UI_LOCALES.contains(value)) {
            throw new BusinessRuleException("ui_locale must be en or es");
        }
        return value;
    }
}
