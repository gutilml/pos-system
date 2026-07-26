package com.pos.core.services.shift;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.dtos.shift.ShiftDetailDTO;
import com.pos.core.models.ShiftStatus;

import java.util.List;
import java.util.UUID;

public interface ShiftService {

    ShiftDTO openShift(OpenShiftRequestDTO request);

    /**
     * Returns the store's currently OPEN shift, or throws {@link com.pos.core.exception.ResourceNotFoundException}
     * when none exists.
     */
    ShiftDTO getCurrentOpenShift(UUID storeId);

    /**
     * Lists shifts for a store, newest {@code openedAt} first. Optional {@code status} filter.
     */
    List<ShiftDTO> listShifts(UUID storeId, ShiftStatus status);

    /**
     * Shift detail with drawer events and tender/expected totals.
     */
    ShiftDetailDTO getShiftDetail(UUID shiftId);

    ShiftDTO closeShift(UUID shiftId, CloseShiftRequestDTO request);

    CashDrawerEventDTO addDrawerEvent(UUID shiftId, CashDrawerEventRequestDTO request);
}
