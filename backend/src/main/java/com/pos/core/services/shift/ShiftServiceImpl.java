package com.pos.core.services.shift;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.BusinessRuleException;
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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class ShiftServiceImpl implements ShiftService {

    public static final int MONEY_SCALE = 4;
    public static final RoundingMode MONEY_ROUNDING = RoundingMode.HALF_UP;

    private final ShiftRepository shiftRepository;
    private final CashDrawerEventRepository cashDrawerEventRepository;
    private final StoreSettingsRepository storeSettingsRepository;
    private final TransactionRepository transactionRepository;

    public ShiftServiceImpl(
            ShiftRepository shiftRepository,
            CashDrawerEventRepository cashDrawerEventRepository,
            StoreSettingsRepository storeSettingsRepository,
            TransactionRepository transactionRepository
    ) {
        this.shiftRepository = shiftRepository;
        this.cashDrawerEventRepository = cashDrawerEventRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    public ShiftDTO openShift(OpenShiftRequestDTO request) {
        StoreSettings store = storeSettingsRepository.findById(request.storeId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.storeId()));

        if (shiftRepository.existsByStoreIdAndStatus(store.getId(), ShiftStatus.OPEN)) {
            throw new BusinessRuleException("Store already has an OPEN shift");
        }

        Shift shift = new Shift();
        shift.setStore(store);
        shift.setStatus(ShiftStatus.OPEN);
        shift.setStartingCash(scaleMoney(request.startingCash()));

        try {
            return toDto(shiftRepository.save(shift));
        } catch (DataIntegrityViolationException ex) {
            throw new BusinessRuleException("Store already has an OPEN shift");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftDTO getCurrentOpenShift(UUID storeId) {
        return shiftRepository.findFirstByStoreIdAndStatus(storeId, ShiftStatus.OPEN)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("No open shift for store: " + storeId));
    }

    @Override
    public CashDrawerEventDTO addDrawerEvent(UUID shiftId, CashDrawerEventRequestDTO request) {
        Shift shift = getShift(shiftId);
        ensureOpen(shift);

        CashDrawerEvent event = new CashDrawerEvent();
        event.setShift(shift);
        event.setType(request.type());
        event.setAmount(scaleMoney(request.amount()));
        event.setReason(request.reason());

        return toDto(cashDrawerEventRepository.save(event));
    }

    @Override
    public ShiftDTO closeShift(UUID shiftId, CloseShiftRequestDTO request) {
        Shift shift = getShift(shiftId);
        ensureOpen(shift);

        BigDecimal expectedCash = calculateExpectedCash(shift);
        BigDecimal actualCash = scaleMoney(request.actualCash());
        BigDecimal discrepancy = actualCash.subtract(expectedCash).setScale(MONEY_SCALE, MONEY_ROUNDING);

        shift.setExpectedCash(expectedCash);
        shift.setActualCash(actualCash);
        shift.setDiscrepancy(discrepancy);
        shift.setStatus(ShiftStatus.CLOSED);
        shift.setClosedAt(OffsetDateTime.now());

        return toDto(shiftRepository.save(shift));
    }

    BigDecimal calculateExpectedCash(Shift shift) {
        BigDecimal expected = scaleMoney(shift.getStartingCash());
        BigDecimal cashSales = transactionRepository.sumGrandTotalByShiftId(shift.getId());
        expected = expected.add(scaleMoney(cashSales));

        for (CashDrawerEvent event : shift.getDrawerEvents()) {
            BigDecimal amount = scaleMoney(event.getAmount());
            if (event.getType() == CashDrawerEventType.PAY_IN) {
                expected = expected.add(amount);
            } else if (event.getType() == CashDrawerEventType.PAY_OUT) {
                expected = expected.subtract(amount);
            }
        }

        return expected.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }

    private Shift getShift(UUID shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found: " + shiftId));
    }

    private void ensureOpen(Shift shift) {
        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw new BusinessRuleException("Shift is not OPEN");
        }
    }

    private ShiftDTO toDto(Shift shift) {
        UUID storeId = shift.getStore() != null ? shift.getStore().getId() : null;
        return new ShiftDTO(
                shift.getId(),
                storeId,
                shift.getStatus(),
                shift.getStartingCash(),
                shift.getExpectedCash(),
                shift.getActualCash(),
                shift.getDiscrepancy(),
                shift.getOpenedAt(),
                shift.getClosedAt()
        );
    }

    private CashDrawerEventDTO toDto(CashDrawerEvent event) {
        UUID shiftId = event.getShift() != null ? event.getShift().getId() : null;
        return new CashDrawerEventDTO(
                event.getId(),
                shiftId,
                event.getType(),
                event.getAmount(),
                event.getReason(),
                event.getCreatedAt()
        );
    }

    private static BigDecimal scaleMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE, MONEY_ROUNDING);
        }
        return value.setScale(MONEY_SCALE, MONEY_ROUNDING);
    }
}
