package com.pos.auth.dtos;

import com.pos.auth.models.Role;

import java.math.BigDecimal;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String username,
        Role role,
        UUID storeId,
        String storeName,
        boolean active,
        boolean enableInventory,
        boolean enableCustomerCredit,
        String uiLocale,
        BigDecimal defaultTaxRate
) {
}
