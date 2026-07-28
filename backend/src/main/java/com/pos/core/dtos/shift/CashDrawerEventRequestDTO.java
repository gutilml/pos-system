package com.pos.core.dtos.shift;

import com.pos.core.models.CashDrawerEventType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CashDrawerEventRequestDTO(
        @NotNull CashDrawerEventType type,
        @NotNull @DecimalMin(value = "0.0001", inclusive = true) BigDecimal amount,
        @NotBlank @Size(min = 10, max = 255)
        @Pattern(regexp = ".*[\\p{L}\\p{N}].*", message = "reason must contain letters or numbers")
        String reason,
        String approvalPassword
) {
    public CashDrawerEventRequestDTO(CashDrawerEventType type, BigDecimal amount, String reason) {
        this(type, amount, reason, null);
    }
}
