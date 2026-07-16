package com.pos.core.dtos;

import java.math.BigDecimal;
import java.util.UUID;

public record CategoryDTO(
        UUID id,
        String name,
        BigDecimal targetMargin
) {
}
