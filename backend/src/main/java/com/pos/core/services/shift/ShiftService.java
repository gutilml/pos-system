package com.pos.core.services.shift;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;

import java.util.UUID;

public interface ShiftService {

    ShiftDTO openShift(OpenShiftRequestDTO request);

    /**
     * Returns the store's currently OPEN shift, or throws {@link com.pos.core.exception.ResourceNotFoundException}
     * when none exists.
     */
    ShiftDTO getCurrentOpenShift(UUID storeId);

    ShiftDTO closeShift(UUID shiftId, CloseShiftRequestDTO request);

    CashDrawerEventDTO addDrawerEvent(UUID shiftId, CashDrawerEventRequestDTO request);
}
