package com.pos.core.services.shift;

import com.pos.auth.models.User;
import com.pos.auth.repositories.UserRepository;
import com.pos.auth.security.PosUserDetails;
import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.dtos.shift.ShiftDetailDTO;
import com.pos.core.exception.BusinessRuleException;
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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
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
    private final UserRepository userRepository;

    public ShiftServiceImpl(
            ShiftRepository shiftRepository,
            CashDrawerEventRepository cashDrawerEventRepository,
            StoreSettingsRepository storeSettingsRepository,
            TransactionRepository transactionRepository,
            UserRepository userRepository
    ) {
        this.shiftRepository = shiftRepository;
        this.cashDrawerEventRepository = cashDrawerEventRepository;
        this.storeSettingsRepository = storeSettingsRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public ShiftDTO openShift(OpenShiftRequestDTO request) {
        User opener = requireCurrentUser();
        StoreSettings store = storeSettingsRepository.findById(request.storeId())
                .orElseThrow(() -> new ResourceNotFoundException("Store not found: " + request.storeId()));

        if (shiftRepository.existsByStoreIdAndStatus(store.getId(), ShiftStatus.OPEN)) {
            throw new BusinessRuleException("Store already has an OPEN shift");
        }

        Shift shift = new Shift();
        shift.setStore(store);
        shift.setStatus(ShiftStatus.OPEN);
        shift.setStartingCash(scaleMoney(request.startingCash()));
        shift.setOpenedBy(opener.getId());

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
    @Transactional(readOnly = true)
    public List<ShiftDTO> listShifts(UUID storeId, ShiftStatus status) {
        if (!storeSettingsRepository.existsById(storeId)) {
            throw new ResourceNotFoundException("Store not found: " + storeId);
        }
        List<Shift> shifts = status == null
                ? shiftRepository.findByStoreIdOrderByOpenedAtDesc(storeId)
                : shiftRepository.findByStoreIdAndStatusOrderByOpenedAtDesc(storeId, status);
        return shifts.stream().map(this::toDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShiftDetailDTO getShiftDetail(UUID shiftId) {
        Shift shift = getShift(shiftId);
        return toDetailDto(shift);
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
        User closer = requireCurrentUser();
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
        shift.setClosedBy(closer.getId());

        return toDto(shiftRepository.save(shift));
    }

    /**
     * Drawer expected cash: starting + CASH tenders − change given + pay-ins − pay-outs.
     * CARD/CREDIT and sale grand totals are excluded (Feature 029).
     */
    BigDecimal calculateExpectedCash(Shift shift) {
        BigDecimal expected = scaleMoney(shift.getStartingCash());
        BigDecimal cashPayments = paymentSum(shift.getId(), PaymentType.CASH);
        BigDecimal changeGiven = scaleMoney(transactionRepository.sumChangeGivenByShiftId(shift.getId()));
        expected = expected.add(cashPayments).subtract(changeGiven);

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

        BigDecimal totalCashPayments = null;
        BigDecimal totalCardPayments = null;
        BigDecimal totalCreditPayments = null;
        BigDecimal totalSalesGrandTotal = null;

        if (shift.getStatus() == ShiftStatus.CLOSED && shift.getId() != null) {
            totalCashPayments = paymentSum(shift.getId(), PaymentType.CASH);
            totalCardPayments = paymentSum(shift.getId(), PaymentType.CARD);
            totalCreditPayments = paymentSum(shift.getId(), PaymentType.CREDIT);
            totalSalesGrandTotal = scaleMoney(transactionRepository.sumGrandTotalByShiftId(shift.getId()));
        }

        return new ShiftDTO(
                shift.getId(),
                storeId,
                shift.getStatus(),
                shift.getStartingCash(),
                shift.getExpectedCash(),
                shift.getActualCash(),
                shift.getDiscrepancy(),
                shift.getOpenedAt(),
                shift.getClosedAt(),
                shift.getOpenedBy(),
                shift.getClosedBy(),
                totalCashPayments,
                totalCardPayments,
                totalCreditPayments,
                totalSalesGrandTotal
        );
    }

    private ShiftDetailDTO toDetailDto(Shift shift) {
        UUID storeId = shift.getStore() != null ? shift.getStore().getId() : null;
        BigDecimal expectedCash = shift.getExpectedCash();
        if (shift.getStatus() == ShiftStatus.OPEN) {
            expectedCash = calculateExpectedCash(shift);
        }

        BigDecimal totalCashPayments = null;
        BigDecimal totalCardPayments = null;
        BigDecimal totalCreditPayments = null;
        BigDecimal totalSalesGrandTotal = null;
        if (shift.getId() != null) {
            totalCashPayments = paymentSum(shift.getId(), PaymentType.CASH);
            totalCardPayments = paymentSum(shift.getId(), PaymentType.CARD);
            totalCreditPayments = paymentSum(shift.getId(), PaymentType.CREDIT);
            totalSalesGrandTotal = scaleMoney(transactionRepository.sumGrandTotalByShiftId(shift.getId()));
        }

        List<CashDrawerEventDTO> events = shift.getDrawerEvents().stream()
                .sorted(Comparator.comparing(
                        CashDrawerEvent::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toDto)
                .toList();

        return new ShiftDetailDTO(
                shift.getId(),
                storeId,
                shift.getStatus(),
                shift.getStartingCash(),
                expectedCash,
                shift.getActualCash(),
                shift.getDiscrepancy(),
                shift.getOpenedAt(),
                shift.getClosedAt(),
                shift.getOpenedBy(),
                shift.getClosedBy(),
                totalCashPayments,
                totalCardPayments,
                totalCreditPayments,
                totalSalesGrandTotal,
                events
        );
    }

    private BigDecimal paymentSum(UUID shiftId, PaymentType method) {
        return scaleMoney(transactionRepository.sumPaymentAmountByShiftIdAndMethod(shiftId, method));
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
