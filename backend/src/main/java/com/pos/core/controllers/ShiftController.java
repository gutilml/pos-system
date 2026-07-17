package com.pos.core.controllers;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.services.shift.ShiftService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @PostMapping("/open")
    @ResponseStatus(HttpStatus.CREATED)
    public ShiftDTO openShift(@Valid @RequestBody OpenShiftRequestDTO request) {
        return shiftService.openShift(request);
    }

    @PostMapping("/{id}/events")
    @ResponseStatus(HttpStatus.CREATED)
    public CashDrawerEventDTO addDrawerEvent(
            @PathVariable UUID id,
            @Valid @RequestBody CashDrawerEventRequestDTO request
    ) {
        return shiftService.addDrawerEvent(id, request);
    }

    @PostMapping("/{id}/close")
    public ShiftDTO closeShift(
            @PathVariable UUID id,
            @Valid @RequestBody CloseShiftRequestDTO request
    ) {
        return shiftService.closeShift(id, request);
    }
}
