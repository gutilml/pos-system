package com.pos.core.services.shift;

import com.pos.auth.models.Role;
import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.ShiftStatus;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.ShiftRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShiftServiceIntegrationTest {

    @Autowired
    private ShiftService shiftService;

    @Autowired
    private ShiftRepository shiftRepository;

    @Autowired
    private StoreSettingsRepository storeSettingsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private StoreSettings store;
    private User cashier;

    @BeforeEach
    void setUp() {
        store = new StoreSettings();
        store.setStoreName("Corner Market");
        store.setFeatures(Map.of("enable_inventory", false));
        store = storeSettingsRepository.saveAndFlush(store);

        cashier = new User();
        cashier.setUsername("shift-cashier");
        cashier.setPasswordHash(passwordEncoder.encode("cashier"));
        cashier.setRole(Role.CASHIER);
        cashier.setStore(store);
        cashier.setActive(true);
        cashier = userRepository.saveAndFlush(cashier);

        var details = new PosUserDetails(cashier);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities())
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void openShift_allowsOnlyOneOpenShiftPerStore() {
        var opened = shiftService.openShift(new OpenShiftRequestDTO(store.getId(), new BigDecimal("100.0000")));

        assertThat(opened.openedBy()).isEqualTo(cashier.getId());
        assertThat(shiftRepository.findFirstByStoreIdAndStatus(store.getId(), ShiftStatus.OPEN)).isPresent();
        assertThatThrownBy(() ->
                shiftService.openShift(new OpenShiftRequestDTO(store.getId(), new BigDecimal("50.0000")))
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("OPEN shift");
    }
}
