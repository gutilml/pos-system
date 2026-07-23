package com.pos.core.services.shift;

import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEvent;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.PaymentType;
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
import static org.mockito.ArgumentMatchers.eq;
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
        assertThat(current.totalCardPayments()).isNull();
        assertThat(current.totalCreditPayments()).isNull();
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
    void closeShift_usesCashPaymentsMinusChangePlusDrawerEvents() {
        CashDrawerEvent payIn = event(CashDrawerEventType.PAY_IN, "10.0000");
        CashDrawerEvent payOut = event(CashDrawerEventType.PAY_OUT, "5.1300");
        shift.getDrawerEvents().add(payIn);
        shift.getDrawerEvents().add(payOut);

        when(shiftRepository.findById(shift.getId())).thenReturn(Optional.of(shift));
        stubPaymentSum(PaymentType.CASH, "50.0000");
        when(transactionRepository.sumChangeGivenByShiftId(shift.getId())).thenReturn(new BigDecimal("0.0000"));
        when(shiftRepository.save(any(Shift.class))).thenAnswer(invocation -> invocation.getArgument(0));
        stubClosedSummaries("50.0000", "20.0000", "5.0000", "75.0000");

        // expected = 100 + 50 - 0 + 10 - 5.13 = 154.87
        ShiftDTO closed = shiftService.closeShift(
                shift.getId(),
                new CloseShiftRequestDTO(new BigDecimal("155.0000"))
        );

        assertThat(closed.status()).isEqualTo(ShiftStatus.CLOSED);
        assertThat(closed.expectedCash()).isEqualByComparingTo("154.8700");
        assertThat(closed.actualCash()).isEqualByComparingTo("155.0000");
        assertThat(closed.discrepancy()).isEqualByComparingTo("0.1300");
        assertThat(closed.totalCashPayments()).isEqualByComparingTo("50.0000");
        assertThat(closed.totalCardPayments()).isEqualByComparingTo("20.0000");
        assertThat(closed.totalCreditPayments()).isEqualByComparingTo("5.0000");
        assertThat(closed.totalSalesGrandTotal()).isEqualByComparingTo("75.0000");
    }

    @Test
    void calculateExpectedCash_ignoresCardAndCreditPayments() {
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CASH))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumChangeGivenByShiftId(shift.getId())).thenReturn(BigDecimal.ZERO);

        BigDecimal expected = shiftService.calculateExpectedCash(shift);

        assertThat(expected).isEqualByComparingTo("100.0000");
    }

    @Test
    void calculateExpectedCash_splitTenderOnlyAddsCashPortion() {
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CASH))
                .thenReturn(new BigDecimal("10.0000"));
        when(transactionRepository.sumChangeGivenByShiftId(shift.getId())).thenReturn(BigDecimal.ZERO);

        BigDecimal expected = shiftService.calculateExpectedCash(shift);

        assertThat(expected).isEqualByComparingTo("110.0000");
    }

    @Test
    void calculateExpectedCash_netsChangeGivenOnCashOverTender() {
        // CASH tender 20, sale 14, change_given 6 → drawer keeps +14
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CASH))
                .thenReturn(new BigDecimal("20.0000"));
        when(transactionRepository.sumChangeGivenByShiftId(shift.getId())).thenReturn(new BigDecimal("6.0000"));

        BigDecimal expected = shiftService.calculateExpectedCash(shift);

        assertThat(expected).isEqualByComparingTo("114.0000");
    }

    @Test
    void calculateExpectedCash_handlesPayOutWithZeroCashSales() {
        shift.getDrawerEvents().add(event(CashDrawerEventType.PAY_OUT, "2.5050"));
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CASH))
                .thenReturn(BigDecimal.ZERO);
        when(transactionRepository.sumChangeGivenByShiftId(shift.getId())).thenReturn(BigDecimal.ZERO);

        BigDecimal expected = shiftService.calculateExpectedCash(shift);

        assertThat(expected).isEqualByComparingTo("97.4950");
    }

    private void stubPaymentSum(PaymentType method, String amount) {
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(eq(shift.getId()), eq(method)))
                .thenReturn(new BigDecimal(amount));
    }

    private void stubClosedSummaries(String cash, String card, String credit, String sales) {
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CASH))
                .thenReturn(new BigDecimal(cash));
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CARD))
                .thenReturn(new BigDecimal(card));
        when(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shift.getId(), PaymentType.CREDIT))
                .thenReturn(new BigDecimal(credit));
        when(transactionRepository.sumGrandTotalByShiftId(shift.getId())).thenReturn(new BigDecimal(sales));
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
