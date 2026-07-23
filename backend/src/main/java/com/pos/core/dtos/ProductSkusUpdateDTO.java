package com.pos.core.dtos;

import java.util.List;

public record ProductSkusUpdateDTO(
        List<String> skus,
        String primarySku
) {
}
