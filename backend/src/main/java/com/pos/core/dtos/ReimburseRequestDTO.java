package com.pos.core.dtos;

import jakarta.validation.Valid;

import java.util.List;

/**
 * Empty body, omitted {@code lines}, or empty {@code lines} means return all remaining
 * returnable quantity on every line.
 */
public record ReimburseRequestDTO(
        @Valid List<ReimburseLineRequestDTO> lines,
        String approvalPassword
) {
    public ReimburseRequestDTO(List<ReimburseLineRequestDTO> lines) {
        this(lines, null);
    }
}
