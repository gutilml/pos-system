package com.pos.core.dtos;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductDTO(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal costPrice,
        BigDecimal sellingPrice,
        Boolean active,
        List<UUID> categoryIds,
        Boolean sellByWeight,
        String unitOfMeasure,
        Boolean excludeFromGlobalDiscounts
) {
}
