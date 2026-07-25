package com.pos.core.services;

import com.pos.core.dtos.ReimburseRequestDTO;
import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;

import java.util.List;
import java.util.UUID;

public interface TransactionService {

    TransactionResponseDTO create(TransactionRequestDTO request);

    List<TransactionResponseDTO> list(UUID storeId);

    TransactionResponseDTO get(UUID id);

    TransactionResponseDTO reimburse(UUID id, ReimburseRequestDTO request);
}
