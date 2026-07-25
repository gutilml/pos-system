package com.pos.customers.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateCustomerRequestDTO(
        @NotBlank String name,
        String phone,
        @NotNull @DecimalMin(value = "0.0000", inclusive = true) BigDecimal creditLimit
) {
}
