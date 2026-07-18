package com.pos.core.services.shift;

import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEvent;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.Shift;
import com.pos.core.models.ShiftStatus;
import com.pos.core.models.StoreSettings;
import com.pos.core.repositories.CashDrawerEventRepository;
import com.pos.core.repositories.ShiftRepository;
import com.pos.core.repositories.StoreSettingsRepository;
import com.pos.core.repositories.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShiftServiceImplTest {

    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private CashDrawerEventRepository cashDrawerEventRepository;

    @Mock
    private StoreSettingsRepository storeSettingsRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ShiftServiceImpl shiftService;

    private Shift shift;

    @BeforeEach
    void setUp() {
        StoreSettings store = new StoreSettings();
        store.setId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
        store.setStoreName("Corner Market");

        shift = new Shift();
        shift.setId(UUID.fromString("22222222-2222-2222-2222-222222222222"));
        shift.setStore(store);
        shift.setStatus(ShiftStatus.OPEN);
        shift.setStartingCash(new BigDecimal("100.0000"));
    }

    @Test
    void getCurrentOpenShift_returnsDtoWhenOpenShiftExists() {
        UUID storeId = shift.getStore().getId();
        when(shiftRepository.findFirstByStoreIdAndStatus(storeId, ShiftStatus.OPEN))
                .thenReturn(Optional.of(shift));

        ShiftDTO current = shiftService.getCurrentOpenShift(storeId);

        assertThat(current.id()).isEqualTo(shift.getId());
        assertThat(current.storeId()).isEqualTo(storeId);
        assertThat(current.status()).isEqualTo(ShiftStatus.OPEN);
        assertThat(current.startingCash()).isEqualByComparingTo("100.0000");
    }

    @Test
    void getCurrentOpenShift_throwsNotFoundWhenRepositoryMiss() {
        UUID storeId = shift.getStore().getId();
        when(shiftRepository.findFirstByStoreIdAndStatus(storeId, ShiftStatus.OPEN))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> shiftService.getCurrentOpenShift(storeId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(storeId.toString());
    }

    @Test
    void closeShift_calculatesExpectedActualAndDiscrepancyWithBigDecimal() {
        CashDrawerEvent payIn = event(CashDrawerEventType.PAY_IN, "10.0000");
        CashDrawerEvent payOut = event(CashDrawerEventType.PAY_OUT, "5.1300");
        shift.getDrawerEvents().add(payIn);
        shift.getDrawerEvents().add(payOut);

        when(shiftRepository.findById(shift.getId())).thenReturn(Optional.of(shift));
        when(transactionRepository.sumGrandTotalByShiftId(shift.getId())).thenReturn(new BigDecimal("45.1200"));
        when(shiftRepository.save(any(Shift.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShiftDTO closed = shiftService.closeShift(
                shift.getId(),
                new CloseShiftRequestDTO(new BigDecimal("150.0000"))
        );

        assertThat(closed.status()).isEqualTo(ShiftStatus.CLOSED);
        assertThat(closed.expectedCash()).isEqualByComparingTo("149.9900");
        assertThat(closed.actualCash()).isEqualByComparingTo("150.0000");
        assertThat(closed.discrepancy()).isEqualByComparingTo("0.0100");
    }

    @Test
    void calculateExpectedCash_handlesZeroSalesAndDrawerEvents() {
        shift.getDrawerEvents().add(event(CashDrawerEventType.PAY_OUT, "2.5050"));
        when(transactionRepository.sumGrandTotalByShiftId(shift.getId())).thenReturn(BigDecimal.ZERO);

        BigDecimal expected = shiftService.calculateExpectedCash(shift);

        assertThat(expected).isEqualByComparingTo("97.4950");
    }

    private CashDrawerEvent event(CashDrawerEventType type, String amount) {
        CashDrawerEvent event = new CashDrawerEvent();
        event.setShift(shift);
        event.setType(type);
        event.setAmount(new BigDecimal(amount));
        event.setReason(type.name());
        return event;
    }
}
