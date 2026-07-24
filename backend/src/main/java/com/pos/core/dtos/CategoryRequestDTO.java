package com.pos.core.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CategoryRequestDTO(
        @NotBlank String name,
        @NotNull BigDecimal targetMargin
) {
}
