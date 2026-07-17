package com.pos.core.services.shift;

import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.exception.BusinessRuleException;
import com.pos.core.models.ShiftStatus;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.ShiftRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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

    @Test
    void openShift_allowsOnlyOneOpenShiftPerStore() {
        StoreSettings store = new StoreSettings();
        store.setStoreName("Corner Market");
        store.setFeatures(Map.of("enable_inventory", false));
        StoreSettings savedStore = storeSettingsRepository.saveAndFlush(store);

        shiftService.openShift(new OpenShiftRequestDTO(savedStore.getId(), new BigDecimal("100.0000")));

        assertThat(shiftRepository.findFirstByStoreIdAndStatus(savedStore.getId(), ShiftStatus.OPEN)).isPresent();
        assertThatThrownBy(() ->
                shiftService.openShift(new OpenShiftRequestDTO(savedStore.getId(), new BigDecimal("50.0000")))
        )
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("OPEN shift");
    }
}
