package com.pos.auth;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.services.payments.StripePaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreSettingsRepository storeSettingsRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private StripePaymentService stripePaymentService;

    private StoreSettings store;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        storeSettingsRepository.deleteAll();

        store = new StoreSettings();
        store.setStoreName("Demo Corner Store");
        store.setFeatures(Map.of("enable_inventory", true));
        store = storeSettingsRepository.save(store);

        userRepository.save(user("admin", "admin", Role.ADMIN, true));
        userRepository.save(user("cashier", "cashier", Role.CASHIER, true));
        userRepository.save(user("inactive", "inactive", Role.CASHIER, false));
    }

    private User user(String username, String password, Role role, boolean active) {
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStore(store);
        user.setActive(active);
        return user;
    }

    @Test
    void protectedEndpoint_requiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_setsHttpOnlyCookie_andMeWorks() throws Exception {
        MvcResult csrfResult = mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.csrfToken").isNotEmpty())
                .andReturn();

        String csrfToken = csrfResult.getResponse().getCookie("XSRF-TOKEN").getValue();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .cookie(csrfResult.getResponse().getCookie("XSRF-TOKEN"))
                        .content("""
                                {"username":"admin","password":"admin"}
                                """))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("POS_TOKEN"))
                .andExpect(cookie().httpOnly("POS_TOKEN", true))
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andReturn();

        var jwtCookie = loginResult.getResponse().getCookie("POS_TOKEN");
        assertThat(jwtCookie).isNotNull();

        mockMvc.perform(get("/api/v1/auth/me").cookie(jwtCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.storeId").value(store.getId().toString()));

        mockMvc.perform(get("/api/v1/products").cookie(jwtCookie))
                .andExpect(status().isOk());
    }

    @Test
    void login_withoutCsrf_returns403() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"admin"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void login_badPassword_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_inactiveUser_returns401() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"inactive","password":"inactive"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_clearsCookie_andBlocksMe() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"admin"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        var jwtCookie = loginResult.getResponse().getCookie("POS_TOKEN");

        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(csrf())
                        .cookie(jwtCookie))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("POS_TOKEN", 0));

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void cashier_canAccessProtectedEndpoint() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"cashier","password":"cashier"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CASHIER"))
                .andReturn();

        mockMvc.perform(get("/api/v1/products").cookie(loginResult.getResponse().getCookie("POS_TOKEN")))
                .andExpect(status().isOk());
    }

    @Test
    void webhook_isPublicWithoutJwt() throws Exception {
        when(stripePaymentService.handleWebhook(anyString(), anyString()))
                .thenReturn("checkout.session.completed");

        mockMvc.perform(post("/api/v1/payments/webhook")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Stripe-Signature", "t=1,v1=abc")
                        .content("{\"id\":\"evt_1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received").value("true"));
    }
}
