package com.pos.regression;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.core.models.Product;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.ProductRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.services.payments.StripePaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
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

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end smoke: cashier register → tax prefs → shift → sale → close → list → reimburse.
 * Excluded from default {@code mvn test} via Surefire {@code excludedGroups=regression}.
 */
@Tag("regression")
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RegisterShiftReimburseRegressionTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StoreSettingsRepository storeSettingsRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private StripePaymentService stripePaymentService;

    private StoreSettings store;
    private Product cola;
    private User cashier;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        productRepository.deleteAll();
        storeSettingsRepository.deleteAll();

        store = new StoreSettings();
        store.setStoreName("Regression Corner");
        store.setFeatures(Map.of("enable_inventory", false, "enable_customer_credit", false));
        store.setPreferences(Map.of());
        store = storeSettingsRepository.save(store);

        cashier = new User();
        cashier.setUsername("reg-cashier");
        cashier.setPasswordHash(passwordEncoder.encode("cashier"));
        cashier.setRole(Role.CASHIER);
        cashier.setStore(store);
        cashier.setActive(true);
        cashier = userRepository.save(cashier);

        cola = new Product();
        cola.setName("Regression Cola");
        cola.setSellingPrice(new BigDecimal("10.0000"));
        cola.setCostPrice(new BigDecimal("5.0000"));
        cola.setActive(true);
        cola = productRepository.save(cola);
    }

    @Test
    void cashierRegisterShiftSaleCloseListAndReimburse() throws Exception {
        var jwt = login("reg-cashier", "cashier");

        mockMvc.perform(patch("/api/v1/stores/{storeId}/settings", store.getId())
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"preferences":{"default_tax_rate":0.1600}}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferences.default_tax_rate").value(0.1600));

        MvcResult openResult = mockMvc.perform(post("/api/v1/shifts/open")
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"storeId":"%s","startingCash":100.0000}
                                """.formatted(store.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.openedBy").value(cashier.getId().toString()))
                .andReturn();
        String shiftId = objectMapper.readTree(openResult.getResponse().getContentAsString()).get("id").asText();

        BigDecimal taxRate = new BigDecimal("0.1600");
        BigDecimal subtotal = new BigDecimal("10.0000");
        BigDecimal taxTotal = subtotal.multiply(taxRate).setScale(4);
        BigDecimal grandTotal = subtotal.add(taxTotal);
        BigDecimal tender = new BigDecimal("20.0000");

        MvcResult saleResult = mockMvc.perform(post("/api/v1/transactions")
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "storeId":"%s",
                                  "taxRate":0.1600,
                                  "items":[{"productId":"%s","quantity":1.0000}],
                                  "payments":[{"paymentMethod":"CASH","amount":20.0000}]
                                }
                                """.formatted(store.getId(), cola.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.createdBy").value(cashier.getId().toString()))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.taxTotal").value(1.6000))
                .andExpect(jsonPath("$.grandTotal").value(11.6000))
                .andReturn();

        JsonNode sale = objectMapper.readTree(saleResult.getResponse().getContentAsString());
        String txId = sale.get("id").asText();
        assertThat(sale.get("changeGiven").decimalValue()).isEqualByComparingTo(tender.subtract(grandTotal));

        mockMvc.perform(post("/api/v1/shifts/{id}/close", shiftId)
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"actualCash":120.0000}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.closedBy").value(cashier.getId().toString()));

        mockMvc.perform(get("/api/v1/shifts").param("storeId", store.getId().toString()).cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(shiftId))
                .andExpect(jsonPath("$[0].status").value("CLOSED"));

        mockMvc.perform(get("/api/v1/transactions").param("storeId", store.getId().toString()).cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(txId))
                .andExpect(jsonPath("$[0].createdBy").value(cashier.getId().toString()))
                .andExpect(jsonPath("$.length()").value(1));

        // Cash reimburse requires an OPEN shift for drawer PAY_OUT.
        mockMvc.perform(post("/api/v1/shifts/open")
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"storeId":"%s","startingCash":100.0000}
                                """.formatted(store.getId())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/transactions/{id}/reimburse", txId)
                        .with(csrf())
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].returnedQuantity").value(1.0000))
                .andExpect(jsonPath("$.items[0].returnableQuantity").value(0.0000));
    }

    private jakarta.servlet.http.Cookie login(String username, String password) throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"%s","password":"%s"}
                                """.formatted(username, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CASHIER"))
                .andReturn();
        var cookie = loginResult.getResponse().getCookie("POS_TOKEN");
        assertThat(cookie).isNotNull();
        return cookie;
    }
}
