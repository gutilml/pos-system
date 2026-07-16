package com.pos.core.services;

import com.pos.core.dtos.TransactionRequestDTO;
import com.pos.core.dtos.TransactionResponseDTO;

public interface TransactionService {

    TransactionResponseDTO create(TransactionRequestDTO request);
}
