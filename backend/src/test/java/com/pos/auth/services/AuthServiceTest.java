package com.pos.auth.services;

import com.pos.auth.dtos.LoginRequestDTO;
import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.AuthCookieService;
import com.pos.auth.security.JwtService;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.models.StoreSettings;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthCookieService authCookieService;
    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private AuthService authService;

    private User admin;
    private StoreSettings store;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        store = new StoreSettings();
        store.setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
        store.setStoreName("Demo Corner Store");

        admin = new User();
        admin.setId(UUID.fromString("00000000-0000-0000-0000-000000000401"));
        admin.setUsername("admin");
        admin.setPasswordHash("hash");
        admin.setRole(Role.ADMIN);
        admin.setStore(store);
        admin.setActive(true);
    }

    @Test
    void login_setsCookieAndReturnsUser() {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.username()).isEqualTo("admin");
        assertThat(result.role()).isEqualTo(Role.ADMIN);
        assertThat(result.storeId()).isEqualTo(store.getId());
        assertThat(result.enableInventory()).isFalse();
        assertThat(result.enableCustomerCredit()).isFalse();
        assertThat(result.uiLocale()).isEqualTo("en");
        assertThat(result.defaultTaxRate()).isNull();
        verify(authCookieService).writeJwtCookie(response, "jwt-token");
    }

    @Test
    void login_exposesDefaultTaxRateFromPreferences() {
        store.setPreferences(Map.of("default_tax_rate", new BigDecimal("0.1600")));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.defaultTaxRate()).isEqualByComparingTo("0.1600");
    }

    @Test
    void login_exposesUiLocaleFromPreferences() {
        store.setPreferences(Map.of("ui_locale", "es"));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.uiLocale()).isEqualTo("es");
    }

    @Test
    void login_exposesEnableInventoryWhenFeatureOn() {
        store.setFeatures(Map.of("enable_inventory", true));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.enableInventory()).isTrue();
    }

    @Test
    void login_exposesEnableCustomerCreditWhenFeatureOn() {
        store.setFeatures(Map.of("enable_customer_credit", true));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.enableCustomerCredit()).isTrue();
    }

    @Test
    void login_enableInventoryFalseWhenFeatureExplicitlyOff() {
        store.setFeatures(Map.of("enable_inventory", false));
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, store.getId()))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.enableInventory()).isFalse();
    }

    @Test
    void login_enableInventoryFalseWhenNoStore() {
        admin.setStore(null);
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("admin", "hash")).thenReturn(true);
        when(jwtService.createToken(admin.getId(), "admin", Role.ADMIN, null))
                .thenReturn("jwt-token");

        var result = authService.login(new LoginRequestDTO("admin", "admin"), response);

        assertThat(result.enableInventory()).isFalse();
        assertThat(result.storeId()).isNull();
    }

    @Test
    void login_rejectsBadPassword() {
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO("admin", "wrong"), response))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_rejectsInactiveUser() {
        admin.setActive(false);
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO("admin", "admin"), response))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void logout_clearsCookie() {
        authService.logout(response);
        verify(authCookieService).clearJwtCookie(response);
    }

    @Test
    void me_returnsCurrentUser() {
        var details = new PosUserDetails(admin);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities())
        );
        when(userRepository.findByUsernameIgnoreCase("admin")).thenReturn(Optional.of(admin));

        var me = authService.me();

        assertThat(me.username()).isEqualTo("admin");
        assertThat(me.storeName()).isEqualTo("Demo Corner Store");
        assertThat(me.enableInventory()).isFalse();
        assertThat(me.uiLocale()).isEqualTo("en");
        assertThat(me.defaultTaxRate()).isNull();
    }
}
