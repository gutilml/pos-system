package com.pos.core.controllers;

import com.pos.core.dtos.shift.CashDrawerEventDTO;
import com.pos.core.dtos.shift.CashDrawerEventRequestDTO;
import com.pos.core.dtos.shift.CloseShiftRequestDTO;
import com.pos.core.dtos.shift.OpenShiftRequestDTO;
import com.pos.core.dtos.shift.ShiftDTO;
import com.pos.core.dtos.shift.ShiftDetailDTO;
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
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
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

    private static ShiftDTO openShiftDto(UUID shiftId, UUID storeId) {
        return new ShiftDTO(
                shiftId,
                storeId,
                ShiftStatus.OPEN,
                new BigDecimal("100.0000"),
                null,
                null,
                null,
                OffsetDateTime.parse("2026-07-16T12:00:00Z"),
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    @Test
    void getCurrentOpenShift_returns200WhenOpen() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.getCurrentOpenShift(storeId)).thenReturn(openShiftDto(shiftId, storeId));

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
    void listShifts_returns200NewestFirst() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID newerId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID olderId = UUID.fromString("33333333-3333-3333-3333-333333333333");

        when(shiftService.listShifts(eq(storeId), isNull())).thenReturn(List.of(
                openShiftDto(newerId, storeId),
                new ShiftDTO(
                        olderId,
                        storeId,
                        ShiftStatus.CLOSED,
                        new BigDecimal("50.0000"),
                        new BigDecimal("50.0000"),
                        new BigDecimal("50.0000"),
                        new BigDecimal("0.0000"),
                        OffsetDateTime.parse("2026-07-01T10:00:00Z"),
                        OffsetDateTime.parse("2026-07-01T18:00:00Z"),
                        null,
                        null,
                        new BigDecimal("0.0000"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("0.0000"),
                        new BigDecimal("0.0000")
                )
        ));

        mockMvc.perform(get("/api/v1/shifts").param("storeId", storeId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(newerId.toString()))
                .andExpect(jsonPath("$[1].id").value(olderId.toString()))
                .andExpect(jsonPath("$[1].status").value("CLOSED"));
    }

    @Test
    void listShifts_passesStatusFilter() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.listShifts(storeId, ShiftStatus.OPEN)).thenReturn(List.of(openShiftDto(shiftId, storeId)));

        mockMvc.perform(get("/api/v1/shifts")
                        .param("storeId", storeId.toString())
                        .param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("OPEN"));
    }

    @Test
    void getShift_returnsDetailWithEvents() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        UUID eventId = UUID.fromString("33333333-3333-3333-3333-333333333333");

        when(shiftService.getShiftDetail(shiftId)).thenReturn(
                new ShiftDetailDTO(
                        shiftId,
                        storeId,
                        ShiftStatus.CLOSED,
                        new BigDecimal("100.0000"),
                        new BigDecimal("149.9900"),
                        new BigDecimal("150.0000"),
                        new BigDecimal("0.0100"),
                        OffsetDateTime.parse("2026-07-16T12:00:00Z"),
                        OffsetDateTime.parse("2026-07-16T20:00:00Z"),
                        null,
                        null,
                        new BigDecimal("40.0000"),
                        new BigDecimal("25.0000"),
                        new BigDecimal("10.0000"),
                        new BigDecimal("75.0000"),
                        List.of(new CashDrawerEventDTO(
                                eventId,
                                shiftId,
                                CashDrawerEventType.PAY_IN,
                                new BigDecimal("10.0000"),
                                "Float top-up",
                                OffsetDateTime.parse("2026-07-16T13:00:00Z")
                        ))
                )
        );

        mockMvc.perform(get("/api/v1/shifts/" + shiftId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(shiftId.toString()))
                .andExpect(jsonPath("$.expectedCash").value(149.9900))
                .andExpect(jsonPath("$.totalCashPayments").value(40.0000))
                .andExpect(jsonPath("$.events[0].type").value("PAY_IN"))
                .andExpect(jsonPath("$.events[0].reason").value("Float top-up"));
    }

    @Test
    void getShift_returns404WhenMissing() throws Exception {
        UUID shiftId = UUID.fromString("99999999-9999-9999-9999-999999999999");
        when(shiftService.getShiftDetail(shiftId))
                .thenThrow(new ResourceNotFoundException("Shift not found: " + shiftId));

        mockMvc.perform(get("/api/v1/shifts/" + shiftId))
                .andExpect(status().isNotFound());
    }

    @Test
    void openShift_returns201() throws Exception {
        UUID storeId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID shiftId = UUID.fromString("22222222-2222-2222-2222-222222222222");

        when(shiftService.openShift(any(OpenShiftRequestDTO.class))).thenReturn(openShiftDto(shiftId, storeId));

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
    void closeShift_returns200WithDiscrepancyAndTenderTotals() throws Exception {
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
                        OffsetDateTime.parse("2026-07-16T20:00:00Z"),
                        null,
                        null,
                        new BigDecimal("40.0000"),
                        new BigDecimal("25.0000"),
                        new BigDecimal("10.0000"),
                        new BigDecimal("75.0000")
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
                .andExpect(jsonPath("$.discrepancy").value(0.0100))
                .andExpect(jsonPath("$.totalCashPayments").value(40.0000))
                .andExpect(jsonPath("$.totalCardPayments").value(25.0000))
                .andExpect(jsonPath("$.totalCreditPayments").value(10.0000))
                .andExpect(jsonPath("$.totalSalesGrandTotal").value(75.0000));
    }
}
