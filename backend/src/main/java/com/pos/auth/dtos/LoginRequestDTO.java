package com.pos.auth.dtos;

import com.pos.auth.models.Role;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @NotBlank String username,
        @NotBlank String password
) {
}
