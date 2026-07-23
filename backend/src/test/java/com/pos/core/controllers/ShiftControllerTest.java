package com.pos.core.controllers;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.exception.GlobalExceptionHandler;
import com.pos.core.exception.ResourceNotFoundException;
import com.pos.core.models.CashDrawerEventType;
import com.pos.core.models.ShiftStatus;
import com.pos.core.services.shift.ShiftService;
import com.pos.testsupport.UnsecuredWebMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@UnsecuredWebMvcTest(controllers = ShiftController.class)
@Import(GlobalExceptionHandler.class)
class ShiftControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ShiftService shiftService;

    @Test
    void getCurrentOpenShift_returns200WhenOpen() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.getCurrentOpenShift(storeId)).thenReturn(
                new ShiftDTO(
                        shiftId,
                        storeId,
                        ShiftStatus.OPEN,
                        new BigDecimal("100.0000"),
                        null,
                        null,
                        null,
                        OffsetDateTime.parse("2026-07-16T12:00:00Z"),
                        null
                )
        );

        mockMvc.perform(get("/api/v1/shifts/current").param("storeId", storeId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(shiftId.toString()))
                .andExpect(jsonPath("$.storeId").value(storeId.toString()))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.startingCash").value(100.0000));
    }

    @Test
    void getCurrentOpenShift_returns404WhenNoneOpen() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");

        when(shiftService.getCurrentOpenShift(storeId))
                .thenThrow(new ResourceNotFoundException("No open shift for store: " + storeId));

        mockMvc.perform(get("/api/v1/shifts/current").param("storeId", storeId.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getCurrentOpenShift_returns400WhenStoreIdMissing() throws Exception {
        mockMvc.perform(get("/api/v1/shifts/current"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void openShift_returns201() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.openShift(any(OpenShiftRequestDTO.class))).thenReturn(
                new ShiftDTO(
                        shiftId,
                        storeId,
                        ShiftStatus.OPEN,
                        new BigDecimal("100.0000"),
                        null,
                        null,
                        null,
                        OffsetDateTime.parse("2026-07-16T12:00:00Z"),
                        null
                )
        );

        String body = """
                {
                  "storeId": "11111111-1111-1111-1111-111111111111",
                  "startingCash": 100.0000
                }
                """;

        mockMvc.perform(post("/api/v1/shifts/open")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(shiftId.toString()))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.startingCash").value(100.0000));
    }

    @Test
    void addDrawerEvent_returns201() throws Exception {
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID eventId = UUID.fromString("33333333-3333-3333-3333-333333333333");

        when(shiftService.addDrawerEvent(eq(shiftId), any(CashDrawerEventRequestDTO.class))).thenReturn(
                new CashDrawerEventDTO(
                        eventId,
                        shiftId,
                        CashDrawerEventType.PAY_OUT,
                        new BigDecimal("5.0000"),
                        "Paid delivery driver",
                        OffsetDateTime.parse("2026-07-16T12:00:00Z")
                )
        );

        String body = """
                {
                  "type": "PAY_OUT",
                  "amount": 5.0000,
                  "reason": "Paid delivery driver"
                }
                """;

        mockMvc.perform(post("/api/v1/shifts/" + shiftId + "/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(eventId.toString()))
                .andExpect(jsonPath("$.type").value("PAY_OUT"));
    }

    @Test
    void closeShift_returns200WithDiscrepancy() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.closeShift(eq(shiftId), any(CloseShiftRequestDTO.class))).thenReturn(
                new ShiftDTO(
                        shiftId,
                        storeId,
                        ShiftStatus.CLOSED,
                        new BigDecimal("100.0000"),
                        new BigDecimal("149.9900"),
                        new BigDecimal("150.0000"),
                        new BigDecimal("0.0100"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z"),
                        OffsetDateTime.parse("2026-07-16T20:00:00Z")
                )
        );

        String body = """
                {
                  "actualCash": 150.0000
                }
                """;

        mockMvc.perform(post("/api/v1/shifts/" + shiftId + "/close")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.expectedCash").value(149.9900))
                .andExpect(jsonPath("$.discrepancy").value(0.0100));
    }
}
